import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Globe, UserCheck, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';
import { InspectorProfileModal } from './InspectorProfileModal';
import { inspectorService } from '../services/inspectorService';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import type { InspectorProfile } from '../types/survey';
import type { User } from '../types/user';

interface HeaderProps {
  onSwitchToAdmin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSwitchToAdmin, onLogout }) => {
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
                {currentUser?.role === 'admin' && (
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded border border-slate-200">
                    Quản trị
                  </span>
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* If Admin is viewing mobile survey view, show button to jump back to Admin Command Center */}
            {currentUser?.role === 'admin' && onSwitchToAdmin && (
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-medium transition-all active:scale-95 shadow-2xs"
                title="Quay lại Bảng điều hành quản trị"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Bảng điều hành</span>
              </button>
            )}

            {/* Profile Trigger */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-[11px] font-bold transition-all active:scale-95 shadow-2xs"
              title={`Tài khoản: ${currentUser?.fullName || profile.name}`}
            >
              {currentUser?.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
              <span className="max-w-[70px] sm:max-w-[90px] truncate">{shortName}</span>
            </button>

            {/* Language Toggle */}
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

            {/* Logout button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-0.5"
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
