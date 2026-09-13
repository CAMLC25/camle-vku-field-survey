import React from 'react';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { SurveyForm } from '../components/SurveyForm';
import { useLanguage } from '../context/LanguageContext';

interface SurveyPageProps {
  onNavigate: (page: 'home' | 'new-survey' | 'history') => void;
}

export const SurveyPage: React.FC<SurveyPageProps> = ({ onNavigate }) => {
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

        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.stepIndicator}</span>
        </div>
      </div>

      {/* Card Header */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-xl bg-vku-50 text-vku-600">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">{t.formHeaderTitle}</h2>
            <p className="text-xs text-slate-500">{t.formHeaderSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <SurveyForm onSuccess={() => onNavigate('history')} />
      </div>
    </div>
  );
};
