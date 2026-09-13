import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { syncService } from '../services/syncService';
import type { SyncState } from '../types/survey';

export function useSync() {
  const [syncInfo, setSyncInfo] = useState(syncService.getState());

  useEffect(() => {
    const unsubscribe = syncService.subscribe((state) => {
      setSyncInfo(state);
    });
    return unsubscribe;
  }, []);

  // Reactive counts directly from IndexedDB
  const surveys = useLiveQuery(() => db.surveys.toArray(), []);

  const totalCount = surveys?.length ?? 0;
  const pendingCount = surveys?.filter((s) => s.status === 'PENDING_SYNC' || s.status === 'SYNCING').length ?? 0;
  const syncedCount = surveys?.filter((s) => s.status === 'SYNCED').length ?? 0;
  const failedCount = surveys?.filter((s) => s.status === 'FAILED').length ?? 0;

  return {
    syncStatus: syncInfo.status as SyncState,
    isSyncing: syncInfo.isSyncing,
    lastSyncTime: syncInfo.lastSyncTime,
    lastError: syncInfo.lastError,
    currentSurveyId: syncInfo.currentSurveyId,
    totalCount,
    pendingCount,
    syncedCount,
    failedCount,
    syncNow: () => syncService.syncNow(),
    retrySingleSurvey: (id: string) => syncService.retrySingleSurvey(id),
    requestBackgroundSync: () => syncService.requestBackgroundSync()
  };
}
