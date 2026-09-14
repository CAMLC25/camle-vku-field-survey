import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSync } from '../hooks/useSync';
import { useLanguage } from '../context/LanguageContext';

/**
 * Smart, minimal network status indicator for the Header.
 * - Online + synced: subtle green indicator.
 * - Online + pending: interactive amber button to sync immediately.
 * - Syncing: animated blue badge.
 * - Offline: clear amber warning.
 */
export const NetworkStatus: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const { isSyncing, pendingCount, syncNow } = useSync();
  const { t } = useLanguage();

  if (!isOnline) {
    if (pendingCount > 0) {
      return (
        <button
          type="button"
          onClick={() => syncNow()}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all active:scale-95"
          title={t.pendingSurveysToSync.replace('{count}', String(pendingCount))}
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {t.statPending}: {pendingCount}
          </span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => syncNow()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 transition-all active:scale-95"
        title={t.offlineSubtitle}
      >
        <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        <span>{t.offline}</span>
      </button>
    );
  }

  if (isSyncing) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 transition-all animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
        <span>{t.syncing}</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={() => syncNow()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all active:scale-95"
        title={t.pendingSurveysToSync.replace('{count}', String(pendingCount))}
      >
        <RefreshCw className="w-3 h-3" />
        <span>
          {t.statPending}: {pendingCount}
        </span>
      </button>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 transition-all whitespace-nowrap shrink-0"
      title={t.onlineSubtitle}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="flex items-center gap-1">
        <Wifi className="w-3 h-3 text-emerald-600" />
        <span className="hidden xs:inline">{t.online}</span>
      </span>
    </div>
  );
};

/**
 * Slim, contextual notification banner.
 * ONLY rendered when offline or syncing. Takes zero space when online & synced!
 */
export const ConnectivityBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const { isSyncing, pendingCount } = useSync();
  const { t } = useLanguage();

  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
        <div className="max-w-xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{t.bannerOfflineNotice}</span>
          </div>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold shrink-0 ml-2">
              {pendingCount} chờ gửi
            </span>
          )}
        </div>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="bg-blue-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center shadow-xs animate-fadeIn">
        <div className="max-w-xl mx-auto w-full flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
          <span>{t.bannerSyncingNotice.replace('{count}', String(pendingCount))}</span>
        </div>
      </div>
    );
  }

  return null;
};
