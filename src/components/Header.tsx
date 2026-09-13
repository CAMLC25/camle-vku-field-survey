import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Globe, UserCheck, Monitor } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';
import { InspectorProfileModal } from './InspectorProfileModal';
import { inspectorService } from '../services/inspectorService';
import { useLanguage } from '../context/LanguageContext';
import type { InspectorProfile } from '../types/survey';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<InspectorProfile>(inspectorService.getProfile());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    return inspectorService.subscribe(setProfile);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  // Extract short display name (e.g. "Nguyễn Văn A" -> "Văn A")
  const shortName = profile.name.trim().split(' ').slice(-2).join(' ') || profile.name;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-vku-600 flex items-center justify-center text-white shadow-sm shadow-vku-600/30">
              <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                  {t.appName}
                </h1>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Inspector Profile Trigger */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-[11px] font-bold transition-all active:scale-95 shadow-2xs"
              title={language === 'vi' ? `Cán bộ: ${profile.name} (${profile.inspectorId})` : `Inspector: ${profile.name}`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="max-w-[70px] sm:max-w-[100px] truncate">{shortName}</span>
            </button>

            {/* Server Dashboard Quick Link */}
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-all active:scale-95 shadow-2xs"
              title={language === 'vi' ? 'Mở Bảng Điều Hành Server (Cổng 3001)' : 'Open Server Dashboard (Port 3001)'}
            >
              <Monitor className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="hidden sm:inline">Server</span>
            </a>

            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all active:scale-95 shadow-2xs"
              title={language === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
            >
              <Globe className="w-3.5 h-3.5 text-vku-600" />
              <span className="text-[11px]">{language === 'vi' ? 'VIE' : 'ENG'}</span>
            </button>

            <NetworkStatus />
          </div>
        </div>
      </header>

      {/* Inspector Profile Modal */}
      <InspectorProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
