import { getPendingSurveys, updateSurveyStatus, retrySurvey } from '../db/surveyRepository';
import { uploadSurvey } from './api';
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
        console.log('[SyncService] Network restored. Initiating auto-sync...');
        this.syncPendingSurveys();
      }
    });

    // Trigger 2: Listen for Service Worker background sync messages
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_TRIGGERED') {
          console.log('[SyncService] Background sync message received from SW');
          this.syncPendingSurveys();
        }
      });
    }

    // Auto-sync on startup if online
    setTimeout(() => {
      if (networkService.isCurrentConnected()) {
        this.syncPendingSurveys();
      }
    }, 1500);
  }

  /**
   * Registers a Background Sync tag with the Service Worker if supported by browser.
   */
  public async requestBackgroundSync(): Promise<boolean> {
    if (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      'SyncManager' in window
    ) {
      try {
        // Protect against hanging forever when SW is not active or in dev mode
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
   * Performs sequential synchronization of all pending or failed surveys.
   * Uploads one survey at a time, awaiting confirmation before advancing.
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

    // Check actual connectivity
    const isOnline = await networkService.getStatus();
    if (!isOnline) {
      console.log('[SyncService] Offline. Cannot sync surveys right now.');
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.syncState = 'SYNCING';
    this.lastError = null;
    this.notify();

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

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
            console.log(`[SyncService] Successfully synced survey ${survey.id}`);
          } else {
            throw new Error(result?.message || 'Server returned unsuccessful response');
          }
        } catch (err: any) {
          // 4. Failed: Keep survey in queue, record error, increment attempts
          const errMsg = err?.message || 'Network or upload error';
          console.error(`[SyncService] Failed to sync survey ${survey.id}:`, errMsg);
          await updateSurveyStatus(survey.id, 'FAILED', errMsg);
          failed++;
          this.lastError = errMsg;
        }

        // Small delay between uploads for visual feedback in demonstrations
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      this.lastSyncTime = new Date().toISOString();
      this.syncState = failed > 0 ? 'ERROR' : 'SYNCED';
    } catch (err: any) {
      console.error('[SyncService] Critical error during synchronization loop:', err);
      this.syncState = 'ERROR';
      this.lastError = err?.message || 'Synchronization halted';
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
   * Manual retry for a specific failed survey.
   */
  public async retrySingleSurvey(surveyId: string): Promise<void> {
    await retrySurvey(surveyId);
    await this.syncPendingSurveys();
  }

  /**
   * Manual trigger from "Sync Now" button.
   */
  public async syncNow(): Promise<void> {
    await this.syncPendingSurveys();
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
