import React from 'react';
import { PlusCircle, History, ArrowRight, Building2, CheckCircle2, AlertTriangle, Clock, RefreshCw, Star, Layers, Camera } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useSync } from '../hooks/useSync';
import { useLanguage } from '../context/LanguageContext';
import { formatRelativeTime } from '../utils/date';
import { authService } from '../services/authService';

interface HomePageProps {
  onNavigate: (page: 'home' | 'new-survey' | 'history') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { pendingCount, isSyncing, syncNow } = useSync();
  const currentUser = authService.getCurrentUser();

  // Reactive queries from Dexie IndexedDB with user scoping
  const allSurveys = useLiveQuery(() => db.surveys.toArray(), []) || [];
  
  const surveys = currentUser?.role === 'admin'
    ? allSurveys
    : allSurveys.filter((s) => {
        if (currentUser?.email && s.createdByEmail) {
          return s.createdByEmail.toLowerCase() === currentUser.email.toLowerCase();
        }
        if (currentUser?.inspectorId && s.inspectorId) {
          return s.inspectorId === currentUser.inspectorId;
        }
        return s.inspectorName === currentUser?.fullName;
      });

  const totalCount = surveys.length;
  const goodCount = surveys.filter((s) => s.condition >= 3).length;
  const defectCount = surveys.filter((s) => s.condition < 3).length;

  const recentSurveys = [...surveys]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const zones = [
    { code: 'K', name: 'Khu K', desc: t.zoneKDesc, count: surveys.filter((s) => s.building.includes('K')).length },
    { code: 'V', name: 'Khu V', desc: t.zoneVDesc, count: surveys.filter((s) => s.building.includes('V')).length },
    { code: 'A', name: 'Khu A', desc: t.zoneADesc, count: surveys.filter((s) => s.building.includes('A')).length },
    { code: 'B', name: 'Khu B', desc: t.zoneBDesc, count: surveys.filter((s) => s.building.includes('B')).length },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Main Hero Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-vku-700 via-vku-600 to-sky-600 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold tracking-wider uppercase mb-2">
            {t.heroBadge}
          </span>

          <h2 className="text-xl font-extrabold tracking-tight">
            {t.heroTitle}
          </h2>
          <p className="text-xs text-sky-100 mt-1 max-w-sm leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex items-center gap-2.5 mt-5">
            <button
              type="button"
              onClick={() => onNavigate('new-survey')}
              className="flex-1 py-3 px-4 rounded-xl bg-white text-vku-700 font-extrabold text-xs shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.btnCreateInspection}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <History className="w-4 h-4" />
              <span>{t.btnViewHistory}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Facility Inspection KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t.kpiTotalInspections}</span>
            <Layers className="w-4 h-4 text-vku-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{totalCount}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t.kpiGoodCondition}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{goodCount}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t.kpiDefectAlert}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{defectCount}</p>
        </div>

        <div className={`p-3.5 rounded-2xl border shadow-2xs transition-all ${
          pendingCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t.kpiPendingSync}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className={`text-2xl font-black ${pendingCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {pendingCount}
            </p>
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => syncNow()}
                disabled={isSyncing}
                className="text-[11px] font-bold text-vku-600 hover:text-vku-800 flex items-center gap-1 active:scale-95"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{t.btnSyncNow}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Campus Priority Zones */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-vku-600" />
          <span>{t.campusZonesTitle}</span>
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {zones.map((zone) => (
            <button
              key={zone.code}
              type="button"
              onClick={() => onNavigate('history')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-vku-50/60 border border-slate-200/80 hover:border-vku-300 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-800 group-hover:text-vku-700">
                  {zone.name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {zone.count} {language === 'vi' ? 'phòng' : 'rooms'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{zone.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Inspections Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t.recentSurveysTitle}
            </h3>
            <p className="text-[11px] text-slate-500">{t.recentSurveysSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-vku-600 hover:text-vku-700 flex items-center gap-1"
          >
            <span>{t.viewList}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSurveys.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-700">{t.noRecentSurveys}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-3">{t.noRecentSurveysSub}</p>
            <button
              type="button"
              onClick={() => onNavigate('new-survey')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vku-600 text-white text-xs font-bold shadow-xs active:scale-95 hover:bg-vku-700 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.btnCreateInspection}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSurveys.map((survey) => (
              <div
                key={survey.id}
                onClick={() => onNavigate('history')}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-1 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    survey.condition >= 3 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {survey.building.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {survey.building} • {survey.room}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {survey.category}
                      </span>
                      {(survey.photo || survey.photoUrl) && (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-blue-50 text-blue-600 font-medium inline-flex items-center gap-0.5" title="Có ảnh tư liệu">
                          <Camera className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {survey.condition}/5
                      </span>
                      <span>•</span>
                      <span>{formatRelativeTime(survey.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {survey.status === 'SYNCED' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.statSynced}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>{t.statPending}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
