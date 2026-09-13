import React from 'react';
import { RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useSync } from '../hooks/useSync';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { formatRelativeTime } from '../utils/date';
import { useLanguage } from '../context/LanguageContext';

export const SyncStatus: React.FC = () => {
  const { isSyncing, pendingCount, syncedCount, failedCount, lastSyncTime, syncNow } = useSync();
  const { isOnline } = useNetworkStatus();
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.queueTitle}
          </h3>
          <p className="text-sm font-extrabold text-slate-800 mt-0.5">
            {pendingCount > 0 ? t.pendingCountSubtitle.replace('{count}', String(pendingCount)) : t.allSurveysUpToDate}
          </p>
        </div>

        <button
          type="button"
          onClick={() => syncNow()}
          disabled={isSyncing || !isOnline}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
            isOnline
              ? 'bg-vku-600 hover:bg-vku-700 text-white focus:ring-2 focus:ring-vku-400'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          } disabled:opacity-70`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? t.btnSyncing : t.btnSyncNow}</span>
        </button>
      </div>

      {/* Metrics breakdown */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
          <div className="flex items-center justify-center gap-1 text-amber-700 text-xs font-bold">
            <Clock className="w-3 h-3" />
            <span>{pendingCount}</span>
          </div>
          <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-tight">{t.statPending}</span>
        </div>

        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{syncedCount}</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-tight">{t.statSynced}</span>
        </div>

        <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
          <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-bold">
            <AlertTriangle className="w-3 h-3" />
            <span>{failedCount}</span>
          </div>
          <span className="text-[10px] font-semibold text-rose-800 uppercase tracking-tight">{t.statFailed}</span>
        </div>
      </div>

      {lastSyncTime && (
        <div className="mt-2.5 text-right text-[11px] text-slate-400 font-medium">
          {t.lastSyncLabel} <span className="text-slate-600 font-semibold">{formatRelativeTime(lastSyncTime)}</span>
        </div>
      )}
    </div>
  );
};
