import React from 'react';
import { ArrowLeft, RefreshCw, PlusCircle } from 'lucide-react';
import { SurveyList } from '../components/SurveyList';
import { useSync } from '../hooks/useSync';
import { useLanguage } from '../context/LanguageContext';

interface HistoryPageProps {
  onNavigate: (page: 'home' | 'new-survey' | 'history') => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { isSyncing, syncNow } = useSync();
  const { t } = useLanguage();

  return (
    <div className="space-y-4 pb-12">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-vku-600 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.btnBack}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => syncNow()}
            disabled={isSyncing}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-vku-50 text-vku-700 hover:bg-vku-100 border border-vku-200 disabled:opacity-60 active:scale-95 transition-all"
            title={t.btnSyncAll}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{t.btnSyncAll}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('new-survey')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-vku-600 text-white hover:bg-vku-700 shadow-xs"
          >
            <PlusCircle className="w-3 h-3" />
            <span>{t.btnNew}</span>
          </button>
        </div>
      </div>

      {/* History List */}
      <SurveyList />
    </div>
  );
};
