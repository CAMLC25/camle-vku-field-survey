import { getPendingSurveys, updateSurveyStatus, retrySurvey, upsertServerSurveys } from '../db/surveyRepository';
import { uploadSurvey, fetchServerSurveys, isNetworkError } from './api';
import { networkService } from './networkService';
import type { SyncState } from '../types/survey';

export type SyncListener = (state: {
  status: SyncState;
  isSyncing: boolean;
  lastSyncTime: string | null;
  lastError: string | null;
  currentSurveyId: string | null;
}) => void;

class SyncService {
  private isSyncing = false;
  private syncState: SyncState = 'IDLE';
  private lastSyncTime: string | null = null;
  private lastError: string | null = null;
  private currentSurveyId: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;

    // Trigger 1: Network connectivity restored
    networkService.addListener((connected) => {
      if (connected) {
        console.log('[SyncService] Network restored. Initiating bi-directional sync...');
        this.syncPendingSurveys().then(() => this.pullSurveysFromCloud());
      }
    });

    // Trigger 2: Listen for Service Worker background sync messages (Chromium / Android)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_TRIGGERED') {
          console.log('[SyncService] Background sync message received from SW');
          this.syncPendingSurveys().then(() => this.pullSurveysFromCloud());
        }
      });
    }

    // Trigger 3: iOS Standalone PWA lifecycle (when user resumes app from iOS Home Screen)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('[SyncService] iOS PWA resumed into foreground. Checking sync...');
          networkService.verifyConnectivity(true).then((online) => {
            if (online) {
              this.syncPendingSurveys().then(() => this.pullSurveysFromCloud());
            }
          });
        }
      });
    }

    // Trigger 4: Periodic auto-sync worker (every 5 seconds)
    // iOS WebKit background sync is unsupported, so this proactive loop checks if pending surveys exist
    // and syncs immediately once network connectivity is verified.
    setInterval(async () => {
      if (this.isSyncing) return;
      try {
        const pending = await getPendingSurveys();
        if (pending.length > 0 && networkService.isCurrentConnected()) {
          console.log(`[SyncService] iOS Auto-sync found ${pending.length} pending surveys. Syncing...`);
          await this.syncPendingSurveys();
        }
      } catch (err) {
        // silent check
      }
    }, 5000);

    // Auto-sync on startup if online: Push pending local drafts & Pull cloud records
    setTimeout(() => {
      if (networkService.isCurrentConnected()) {
        this.syncPendingSurveys().then(() => this.pullSurveysFromCloud());
      }
    }, 1500);
  }

  /**
   * Registers a Background Sync tag with the Service Worker if supported by browser.
   * Gracefully skips on iOS Safari / WebKit without throwing.
   */
  public async requestBackgroundSync(): Promise<boolean> {
    if (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      'SyncManager' in window
    ) {
      try {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
        ]);

        if (registration && 'sync' in registration) {
          // @ts-ignore - Background Sync API
          await registration.sync.register('sync-surveys');
          console.log('[SyncService] Registered Background Sync tag: "sync-surveys"');
          return true;
        }
      } catch (err) {
        console.warn('[SyncService] Background sync registration timed out or failed:', err);
      }
    }
    return false;
  }

  /**
   * Performs sequential synchronization of all pending surveys.
   * Uploads one survey at a time with pre-flight check and graceful weak network handling.
   */
  public async syncPendingSurveys(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    // Mutex lock to prevent concurrent sync loops
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress, skipping concurrent run.');
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    // Pre-flight check: verify actual server connectivity
    const isConnected = await networkService.verifyConnectivity(true);
    if (!isConnected) {
      console.log('[SyncService] Offline or weak network detected. Keeping surveys safely in offline queue.');
      this.syncState = 'IDLE';
      this.notify();
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.syncState = 'SYNCING';
    this.lastError = null;
    this.notify();

    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    let stoppedEarlyDueToNetwork = false;

    try {
      const pending = await getPendingSurveys();

      if (pending.length === 0) {
        console.log('[SyncService] No pending surveys to synchronize.');
        this.syncState = 'IDLE';
        this.isSyncing = false;
        this.currentSurveyId = null;
        this.notify();
        return { processed: 0, succeeded: 0, failed: 0 };
      }

      console.log(`[SyncService] Starting sequential sync for ${pending.length} surveys...`);

      // Sequential processing: strictly one-by-one
      for (const survey of pending) {
        this.currentSurveyId = survey.id;
        processed++;

        // 1. Mark status = SYNCING in IndexedDB
        await updateSurveyStatus(survey.id, 'SYNCING');
        this.notify();

        try {
          // 2. Upload survey and await response
          const result = await uploadSurvey(survey);

          if (result && result.success) {
            // 3. Mark status = SYNCED in IndexedDB
            await updateSurveyStatus(survey.id, 'SYNCED');
            succeeded++;
            networkService.reportNetworkSuccess();
            console.log(`[SyncService] Successfully synced survey ${survey.id}`);
          } else {
            throw new Error(result?.message || 'Server returned unsuccessful response');
          }
        } catch (err: any) {
          const isNetworkIssue = isNetworkError(err);

          if (isNetworkIssue) {
            // Network dropped or timed out on weak mobile signal
            // CRITICAL: DO NOT mark survey as FAILED! Revert to PENDING_SYNC!
            console.warn(`[SyncService] Network drop while syncing survey ${survey.id}:`, err?.message);
            await updateSurveyStatus(
              survey.id,
              'PENDING_SYNC',
              'Đã lưu an toàn trên máy (sẽ tự gửi lại khi có mạng ổn định)'
            );
            networkService.reportNetworkFailure();
            stoppedEarlyDueToNetwork = true;
            // Stop the loop immediately so other surveys don't hang and freeze UI
            break;
          } else {
            // Permanent data / server error (e.g. 400 Bad Request)
            const errMsg = err?.message || 'Lỗi xử lý dữ liệu từ máy chủ';
            console.error(`[SyncService] Survey data rejected by server ${survey.id}:`, errMsg);
            await updateSurveyStatus(survey.id, 'FAILED', errMsg);
            failed++;
            this.lastError = errMsg;
          }
        }

        // Small delay between uploads for visual feedback
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      this.lastSyncTime = new Date().toISOString();
      if (stoppedEarlyDueToNetwork) {
        // Paused cleanly without alarming the user
        this.syncState = 'IDLE';
        this.lastError = 'Mạng yếu hoặc mất kết nối. Dữ liệu vẫn được bảo vệ an toàn.';
      } else {
        this.syncState = failed > 0 ? 'ERROR' : 'SYNCED';
      }
    } catch (err: any) {
      console.error('[SyncService] Critical error during synchronization loop:', err);
      this.syncState = 'ERROR';
      this.lastError = err?.message || 'Đồng bộ bị gián đoạn';
    } finally {
      this.isSyncing = false;
      this.currentSurveyId = null;
      this.notify();

      // Reset 'SYNCED' state back to 'IDLE' after 4 seconds
      if (this.syncState === 'SYNCED') {
        setTimeout(() => {
          if (this.syncState === 'SYNCED') {
            this.syncState = 'IDLE';
            this.notify();
          }
        }, 4000);
      }
    }

    return { processed, succeeded, failed };
  }

  /**
   * Pulls verified surveys from Cloudflare KV central database into local IndexedDB.
   * Enables cross-device persistence when a user logs in from a new device or browser.
   */
  public async pullSurveysFromCloud(): Promise<number> {
    if (!networkService.isCurrentConnected()) return 0;
    try {
      const serverSurveys = await fetchServerSurveys();
      if (Array.isArray(serverSurveys) && serverSurveys.length > 0) {
        const count = await upsertServerSurveys(serverSurveys);
        console.log(`[SyncService] Successfully synchronized ${count} records from Cloudflare.`);
        return count;
      }
    } catch (e) {
      console.warn('[SyncService] Pull from Cloudflare deferred:', e);
    }
    return 0;
  }

  /**
   * Manual retry for a specific failed survey.
   */
  public async retrySingleSurvey(surveyId: string): Promise<void> {
    await retrySurvey(surveyId);
    await networkService.verifyConnectivity(true);
    await this.syncPendingSurveys();
  }

  /**
   * Manual trigger from "Sync Now" button.
   * Performs both pushing local drafts to cloud and pulling latest cloud records.
   */
  public async syncNow(): Promise<void> {
    await networkService.verifyConnectivity(true);
    await this.syncPendingSurveys();
    await this.pullSurveysFromCloud();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState() {
    return {
      status: this.syncState,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      lastError: this.lastError,
      currentSurveyId: this.currentSurveyId
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });
  }
}

export const syncService = new SyncService();
