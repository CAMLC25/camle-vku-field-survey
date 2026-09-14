import React, { useState } from 'react';
import { Shield, UserCheck, Lock, Mail, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import type { UserRole } from '../types/user';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('inspector');
  const [inspectorId, setInspectorId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await authService.login(email, password);
        if (res.success) {
          onSuccess();
        } else {
          setError(res.message || 'Đăng nhập không thành công.');
        }
      } else {
        if (!fullName.trim()) {
          setError('Vui lòng nhập họ và tên.');
          setLoading(false);
          return;
        }
        const res = await authService.register({
          email,
          password,
          fullName,
          role,
          inspectorId: role === 'inspector' ? inspectorId : undefined
        });
        if (res.success) {
          onSuccess();
        } else {
          setError(res.message || 'Đăng ký không thành công.');
        }
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleType: 'inspector' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      if (roleType === 'inspector') {
        setEmail('canbo@vku.udn.vn');
        setPassword('123456');
        const res = await authService.login('canbo@vku.udn.vn', '123456');
        if (res.success) onSuccess();
      } else {
        setEmail('admin@vku.udn.vn');
        setPassword('admin123');
        const res = await authService.login('admin@vku.udn.vn', 'admin123');
        if (res.success) onSuccess();
      }
    } catch {
      setError('Lỗi đăng nhập nhanh demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-vku-900 to-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* VKU Header Banner */}
        <div className="bg-vku-800 px-6 py-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-vku-800 font-black text-2xl shadow-lg shadow-black/20 mb-3 border-2 border-blue-400">
            VKU
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">HỆ THỐNG KHẢO SÁT HIỆN TRƯỜNG</h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hỗ trợ xác thực Offline & Online</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors ${
              tab === 'login'
                ? 'text-vku-600 border-b-2 border-vku-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors ${
              tab === 'register'
                ? 'text-vku-600 border-b-2 border-vku-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Đăng Ký Tài Khoản
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Lê Cảm"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phân quyền (Role)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('inspector')}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        role === 'inspector'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Cán bộ kiểm định</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        role === 'admin'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Quản trị viên</span>
                    </button>
                  </div>
                </div>

                {role === 'inspector' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã cán bộ (Tuỳ chọn)
                    </label>
                    <input
                      type="text"
                      value={inspectorId}
                      onChange={(e) => setInspectorId(e.target.value)}
                      placeholder="Ví dụ: VKU-2025-01"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="canbo@vku.udn.vn"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-vku-600 hover:bg-vku-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-vku-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản & Tiếp Tục'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo 1-tap logins */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Đăng nhập nhanh thử nghiệm (1 chạm)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('inspector')}
                disabled={loading}
                className="flex items-center gap-2 p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold leading-none">👨‍💼 Cán bộ kiểm định</div>
                  <div className="text-[9px] text-blue-600/80 mt-0.5">canbo@vku.udn.vn</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="flex items-center gap-2 p-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold leading-none">🛡️ Quản trị viên (Admin)</div>
                  <div className="text-[9px] text-indigo-600/80 mt-0.5">admin@vku.udn.vn</div>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500">
          Sinh viên thực hiện: <span className="font-semibold text-slate-700">Lê Cảm (23IT022)</span> • VKU 2025
        </div>

      </div>
    </div>
  );
};
