import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ConnectivityBanner } from './components/NetworkStatus';
import { HomePage } from './pages/HomePage';
import { SurveyPage } from './pages/SurveyPage';
import { HistoryPage } from './pages/HistoryPage';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LayoutDashboard, PlusCircle, History } from 'lucide-react';
import { useSync } from './hooks/useSync';
import { useLanguage } from './context/LanguageContext';
import { authService } from './services/authService';
import type { User } from './types/user';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'survey'>('dashboard');
  const [activeTab, setActiveTab] = useState<'home' | 'new-survey' | 'history'>('home');
  const { pendingCount } = useSync();
  const { t } = useLanguage();

  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
      if (user?.role === 'admin') {
        setAdminViewMode('dashboard');
      }
    });
  }, []);

  // 1. If not authenticated, render Login/Sign-up
  if (!currentUser) {
    return <AuthPage onSuccess={() => {}} />;
  }

  // 2. If Admin and in Dashboard mode, render Command Center
  if (currentUser.role === 'admin' && adminViewMode === 'dashboard') {
    return (
      <AdminDashboardPage
        onSwitchToInspectorView={() => setAdminViewMode('survey')}
        onLogout={() => authService.logout()}
      />
    );
  }

  // 3. Mobile Survey PWA (for Inspector, or Admin in survey preview mode)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Admin Inspection Mode Ribbon: clearly notifies admin they are in mobile inspection simulation */}
      {currentUser.role === 'admin' && (
        <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              Đang ở chế độ Kiểm định Hiện trường (Giao diện Cán bộ)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAdminViewMode('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs active:scale-95"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Về Bảng điều hành</span>
          </button>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        onLogout={() => authService.logout()}
      />

      {/* Contextual Network/Sync Banner (only appears when offline or syncing) */}
      <ConnectivityBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 pb-24">
        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} />}
        {activeTab === 'new-survey' && <SurveyPage onNavigate={setActiveTab} />}
        {activeTab === 'history' && <HistoryPage onNavigate={setActiveTab} />}
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-6 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
              activeTab === 'home' ? 'text-vku-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>{t.navHome}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new-survey')}
            className={`relative flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
              activeTab === 'new-survey' ? 'text-vku-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="w-10 h-10 -mt-5 rounded-full bg-vku-600 text-white flex items-center justify-center shadow-md shadow-vku-600/40 hover:scale-105 active:scale-95 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span>{t.navNewSurvey}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`relative flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
              activeTab === 'history' ? 'text-vku-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History className="w-5 h-5" />
            <span>{t.navHistory}</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1 right-2 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[9px] font-extrabold shadow-xs">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
