import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, CheckCircle2, ArrowRight, Info, ShieldCheck, UserCheck } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Thông tin xác thực không chính xác.');
      }
    } catch {
      setError('Không thể thiết lập kết nối tới dịch vụ xác thực.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCredential = async (roleType: 'inspector' | 'admin') => {
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
      setError('Lỗi kích hoạt phiên kiểm thử.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* VKU Header Banner */}
        <div className="bg-slate-900 px-6 py-7 text-white text-center border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl tracking-tight mb-3 shadow-sm shadow-blue-600/30">
            VKU
          </div>
          <h1 className="text-base font-bold tracking-tight text-slate-100">
            HỆ THỐNG QUẢN LÝ KHẢO SÁT CƠ SỞ VẬT CHẤT
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Trường Đại học CNTT & Truyền thông Việt - Hàn
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hệ Thống Số Hóa Cơ Sở Vật Chất • Ban QTCNS</span>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Xác thực người dùng</h2>
              <p className="text-xs text-slate-500">Đăng nhập tài khoản định danh nội bộ</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Cổng Nội Bộ VKU
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tài khoản Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="canbo@vku.udn.vn"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-shadow"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Xác thực & Truy cập</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Access Policy Notice */}
          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-[11px] text-slate-600">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>Phân quyền tài khoản do Ban Quản Trị phụ trách. Liên hệ bộ phận Kỹ thuật nếu cần cấp quyền mới.</span>
          </div>

          {/* Development Testing Credentials */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Tài khoản truy cập nhanh theo phân quyền
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickCredential('inspector')}
                disabled={loading}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-colors text-left"
              >
                <div className="w-6 h-6 rounded bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">Cán bộ khảo sát</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">canbo@vku.udn.vn</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCredential('admin')}
                disabled={loading}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-colors text-left"
              >
                <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">Quản trị hệ thống</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">admin@vku.udn.vn</div>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Engineering Attribution Footer */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Hệ thống phát triển bởi: <span className="font-semibold text-slate-700">Lê Cảm (23IT022)</span> • VKU
        </div>

      </div>
    </div>
  );
};
