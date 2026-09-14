export type SurveyStatus = 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';

export type SurveyCategory =
  | 'Hardware'
  | 'Projector'
  | 'AC'
  | 'Electrical'
  | 'Furniture';

export const SURVEY_CATEGORIES: SurveyCategory[] = [
  'Hardware',
  'Projector',
  'AC',
  'Electrical',
  'Furniture'
];

export interface Survey {
  id: string; // UUID v4
  building: string;
  floor: string;
  room: string;
  category: SurveyCategory;
  condition: number; // 1 - 5
  defectNotes: string;
  photo: Blob | null;
  photoUrl?: string; // transient preview URL or server static URL
  inspectorName?: string; // Tên cán bộ kiểm định
  inspectorId?: string; // Mã cán bộ / Đơn vị
  createdByEmail?: string; // Email tài khoản tạo phiếu (Data isolation)
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  status: SurveyStatus;
  syncAttempts: number;
  lastSyncError: string | null;
}

export interface InspectorProfile {
  name: string;
  inspectorId: string;
  department: string;
}

export interface SyncQueueItem {
  id?: number; // Auto-incremented primary key
  surveyId: string; // References Survey.id
  addedAt: string;
  attempts: number;
  status: 'QUEUED' | 'PROCESSING' | 'FAILED';
  lastError: string | null;
}

export type NetworkState = 'ONLINE' | 'OFFLINE';

export type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR';
