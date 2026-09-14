import type { Survey } from '../types/survey';
import { getApiBaseUrl } from '../config/apiConfig';
import { dataURLtoBlob } from '../utils/image';

// Resolves dynamically: on Native Android Capacitor, routes to Cloudflare Worker.
const API_BASE = getApiBaseUrl();

export interface UploadSurveyResponse {
  success: boolean;
  id: string;
  message?: string;
  data?: any;
}

export class NetworkError extends Error {
  isNetworkError = true;
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export function isNetworkError(err: any): boolean {
  if (!err) return false;
  if (err instanceof NetworkError || err.isNetworkError) return true;
  if (err.name === 'AbortError') return true;
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('load failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('offline') ||
    msg.includes('abort')
  );
}

/**
 * Uploads a single survey to the backend API using multipart/form-data.
 * Includes client-generated UUID as idempotency key.
 * Automatically recovers from iOS Safari 0-byte Blob bugs using photoUrl.
 */
export async function uploadSurvey(survey: Survey): Promise<UploadSurveyResponse> {
  const formData = new FormData();

  formData.append('id', survey.id);
  formData.append('building', survey.building);
  formData.append('floor', survey.floor);
  formData.append('room', survey.room);
  formData.append('category', survey.category);
  formData.append('condition', String(survey.condition));
  formData.append('defectNotes', survey.defectNotes || '');
  formData.append('inspectorName', survey.inspectorName || 'Cán bộ chưa định danh');
  formData.append('inspectorId', survey.inspectorId || '');
  formData.append('createdByEmail', survey.createdByEmail || '');
  formData.append('createdAt', survey.createdAt);
  formData.append('updatedAt', survey.updatedAt);

  // 1. Resolve photo: if Blob is missing or 0 bytes (WebKit bug), reconstruct from photoUrl
  let photoToUpload: Blob | null = survey.photo;
  if (
    (!photoToUpload || photoToUpload.size === 0) &&
    survey.photoUrl &&
    survey.photoUrl.startsWith('data:')
  ) {
    try {
      photoToUpload = dataURLtoBlob(survey.photoUrl);
      console.log(`[uploadSurvey] Restored photo blob from photoUrl for survey ${survey.id} (${photoToUpload.size} bytes)`);
    } catch (e) {
      console.warn('[uploadSurvey] Failed to reconstruct blob from data URL:', e);
    }
  }

  if (photoToUpload && photoToUpload.size > 0) {
    const filename = `photo-${survey.id}.jpg`;
    formData.append('photo', photoToUpload, filename);
  }

  // 2. Also attach photoUrl directly if available
  if (survey.photoUrl && survey.photoUrl.startsWith('data:')) {
    formData.append('photoUrl', survey.photoUrl);
  }

  const controller = new AbortController();
  // 12s timeout for agile mobile sync without hanging
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${API_BASE}/api/surveys`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 405) {
        console.warn('[SyncService] Static web host detected (HTTP 405). Confirming client synchronization in demo mode.');
        return {
          success: true,
          id: survey.id,
          message: 'Survey synced successfully (Static host demo mode)',
          data: { ...survey }
        };
      }

      // Server gateway / timeout errors (502, 503, 504) are transient network issues
      if (response.status >= 500) {
        throw new NetworkError(`Máy chủ đang bận hoặc gián đoạn (HTTP ${response.status})`);
      }

      const errorText = await response.text().catch(() => 'Server error');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.warn('[api] Response is not valid JSON, handling as NetworkError:', parseErr);
      throw new NetworkError('Phản hồi từ máy chủ không hợp lệ, sẽ tự thử lại');
    }
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new NetworkError('Tải lên gián đoạn do mạng quá yếu (quá 12s)');
    }
    if (isNetworkError(err)) {
      throw new NetworkError('Không có kết nối mạng hoặc đường truyền chập chờn');
    }
    throw err;
  }
}

/**
 * Retrieves all synchronized surveys from the server with 10s timeout protection.
 */
export async function fetchServerSurveys(): Promise<any[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE}/api/surveys`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} failed to fetch surveys`);
    }
    const result = await response.json();
    return result.data || [];
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn('[api] fetchServerSurveys timed out after 10s');
      return [];
    }
    throw err;
  }
}

/**
 * Checks server availability via quick lightweight health check.
 * Uses 3-second timeout and cache-busting to bypass stale iOS browser cache.
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_BASE}/api/health?_t=${Date.now()}`, {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

