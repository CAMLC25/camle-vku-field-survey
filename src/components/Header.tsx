import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Globe, UserCheck, Shield, LogOut } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';
import { InspectorProfileModal } from './InspectorProfileModal';
import { inspectorService } from '../services/inspectorService';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import type { InspectorProfile } from '../types/survey';
import type { User } from '../types/user';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<InspectorProfile>(inspectorService.getProfile());
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const unsubInspector = inspectorService.subscribe(setProfile);
    const unsubAuth = authService.subscribe(setCurrentUser);
    return () => {
      unsubInspector();
      unsubAuth();
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const shortName = (currentUser?.fullName || profile.name).trim().split(' ').slice(-2).join(' ') || profile.name;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Logo and Application Identity */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-vku-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-vku-600/30">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                  {t.appName}
                </h1>
                {currentUser?.role === 'admin' && (
                  <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 text-[9px] font-bold rounded-full border border-purple-200 shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[9px] text-slate-400 font-medium truncate hidden xs:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Header Actions with clean spacing & no wrapping */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Profile Pill */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-all active:scale-95 shadow-2xs"
              title={`Hồ sơ: ${currentUser?.fullName || profile.name}`}
            >
              {currentUser?.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
              <span className="max-w-[75px] sm:max-w-[105px] truncate font-semibold">
                {currentUser?.role === 'admin' ? 'Quản trị viên' : shortName}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-1.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-bold transition-all active:scale-95 shadow-2xs"
              title={language === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
            >
              <Globe className="w-3.5 h-3.5 text-vku-600" />
              <span>{language === 'vi' ? 'VIE' : 'ENG'}</span>
            </button>

            {/* Network / Sync Status */}
            <NetworkStatus />

            {/* Logout button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
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
