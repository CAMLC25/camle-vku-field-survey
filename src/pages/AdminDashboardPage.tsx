import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Camera,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  Search,
  UserCheck,
  Shield,
  LogOut,
  Smartphone,
  Plus,
  X,
  Users
} from 'lucide-react';
import { authService } from '../services/authService';
import { getApiBaseUrl } from '../config/apiConfig';
import type { User, UserRole } from '../types/user';

interface SurveyItem {
  id: string;
  building: string;
  floor: string;
  room: string;
  category: string;
  condition: number;
  defectNotes: string;
  inspectorName: string;
  inspectorId?: string;
  photoUrl?: string | null;
  createdAt: string;
  serverSyncedAt?: string;
}

interface AdminDashboardPageProps {
  onSwitchToInspectorView: () => void;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onSwitchToInspectorView,
  onLogout
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'surveys' | 'users'>('surveys');
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // New user modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('inspector');
  const [newInspectorId, setNewInspectorId] = useState('');
  const [userError, setUserError] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();

  const fetchSurveysData = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/surveys`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSurveys(data.data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch surveys:', e);
    }
  };

  const fetchUsersData = async () => {
    try {
      const list = await authService.getUsers();
      setUsers(list);
    } catch (e) {
      console.warn('Failed to fetch users:', e);
    }
  };

  const reloadAll = async () => {
    setLoading(true);
    await Promise.all([fetchSurveysData(), fetchUsersData()]);
    setLoading(false);
  };

  useEffect(() => {
    reloadAll();
    const interval = setInterval(fetchSurveysData, 10000); // 10s background sync
    return () => clearInterval(interval);
  }, []);

  // Filtered surveys
  const filteredSurveys = useMemo(() => {
    return surveys.filter((item) => {
      if (selectedBuilding !== 'ALL' && item.building !== selectedBuilding) return false;
      if (selectedCondition !== 'ALL') {
        if (selectedCondition === 'CRITICAL' && item.condition > 2) return false;
        if (selectedCondition === 'WARNING' && item.condition !== 3) return false;
        if (selectedCondition === 'GOOD' && item.condition < 4) return false;
      }
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.building} ${item.room} ${item.floor} ${item.category} ${item.inspectorName} ${item.defectNotes}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [surveys, selectedBuilding, selectedCondition, selectedCategory, searchQuery]);

  // KPI stats
  const stats = useMemo(() => {
    const total = surveys.length;
    const critical = surveys.filter((s) => s.condition <= 2).length;
    const warning = surveys.filter((s) => s.condition === 3).length;
    const good = surveys.filter((s) => s.condition >= 4).length;
    const photos = surveys.filter((s) => !!s.photoUrl).length;
    return { total, critical, warning, good, photos };
  }, [surveys]);

  // Delete survey
  const handleDeleteSurvey = async (id: string) => {
    if (!confirm(`Bạn có chắc muốn xóa biên bản khảo sát ${id} khỏi hệ thống máy chủ cơ sở dữ liệu?`)) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/surveys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSurveys((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      alert('Lỗi kết nối khi xóa phiếu');
    }
  };

  // Delete user
  const handleDeleteUser = async (id: string, email: string) => {
    if (email === currentUser?.email) {
      alert('Không thể xóa tài khoản của chính bạn đang đăng nhập!');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa tài khoản ${email}?`)) return;
    await authService.deleteUser(id);
    fetchUsersData();
  };

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setUserError('Vui lòng điền đủ thông tin');
      return;
    }
    const res = await authService.createUser({
      email: newEmail,
      password: newPassword,
      fullName: newFullName,
      role: newRole,
      inspectorId: newRole === 'inspector' ? newInspectorId : undefined
    });
    if (res.success) {
      setIsAddUserOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewInspectorId('');
      fetchUsersData();
    } else {
      setUserError(res.message || 'Lỗi khi tạo người dùng');
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (surveys.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }
    const headers = [
      'Mã Khảo Sát',
      'Tòa Nhà',
      'Tầng',
      'Phòng',
      'Hạng Mục',
      'Mức Độ Tình Trạng (1-5)',
      'Mô Tả Sự Cố / Hư Hỏng',
      'Cán Bộ Kiểm Định',
      'Mã Cán Bộ',
      'Thời Gian Khảo Sát',
      'Có Ảnh Chụp'
    ];
    const rows = surveys.map((s) => [
      s.id,
      `"${s.building || ''}"`,
      `"${s.floor || ''}"`,
      `"${s.room || ''}"`,
      `"${s.category || ''}"`,
      s.condition,
      `"${(s.defectNotes || '').replace(/"/g, '""')}"`,
      `"${s.inspectorName || ''}"`,
      `"${s.inspectorId || ''}"`,
      `"${new Date(s.createdAt).toLocaleString('vi-VN')}"`,
      s.photoUrl ? 'Có' : 'Không'
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VKU_KhaoSat_BaoCao_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buildings = ['ALL', 'Khu V', 'Khu K', 'Thư viện', 'Ký túc xá', 'Nhà Đa Năng'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              VKU
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-white">
                  BẢNG ĐIỀU HÀNH & GIÁM SÁT CƠ SỞ VẬT CHẤT
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-emerald-400 border border-slate-700">
                  Dữ Liệu Trực Tuyến Đã Kết Nối
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Hệ thống tổng hợp và phân tích dữ liệu kiểm định hiện trường theo thời gian thực
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-xs active:scale-95"
              title="Xuất dữ liệu định dạng CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất CSV</span>
            </button>

            {/* Switch to Inspector Survey Mode */}
            <button
              onClick={onSwitchToInspectorView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-xs active:scale-95"
              title="Chuyển sang giao diện khảo sát PWA"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chế độ Khảo sát</span>
            </button>

            <button
              onClick={reloadAll}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Làm mới dữ liệu từ máy chủ"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* User Badge & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-white">{currentUser?.fullName}</div>
                <div className="text-[10px] text-slate-400">Quản Trị Viên</div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                title="Đăng xuất khỏi phiên làm việc"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveAdminTab('surveys')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeAdminTab === 'surveys'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Dữ Liệu Khảo Sát ({surveys.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeAdminTab === 'users'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Phân Quyền Người Dùng ({users.length})</span>
            </button>
          </div>

          {activeAdminTab === 'users' && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cấp Tài Khoản Mới</span>
            </button>
          )}
        </div>

        {/* Tab 1: Surveys View */}
        {activeAdminTab === 'surveys' && (
          <>
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tổng Biên Bản</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Đồng bộ máy chủ trung tâm</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs bg-gradient-to-b from-white to-red-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-700">Sự Cố Cấp Độ Cao</span>
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-red-600">{stats.critical}</div>
                <p className="text-[11px] text-red-500 mt-0.5">Mức 1 & 2 (Ưu tiên xử lý)</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-gradient-to-b from-white to-amber-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700">Bảo Trì Kỹ Thuật</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-amber-600">{stats.warning}</div>
                <p className="text-[11px] text-amber-500 mt-0.5">Mức 3 (Trung bình)</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-gradient-to-b from-white to-emerald-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700">Vận Hành Tốt</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-600">{stats.good}</div>
                <p className="text-[11px] text-emerald-600 mt-0.5">Mức 4 & 5 (Đạt tiêu chuẩn)</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Hồ Sơ Ảnh</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-purple-600">{stats.photos}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Minh chứng đính kèm</p>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              {/* Building filter pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1">Tòa nhà:</span>
                {buildings.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBuilding(b)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedBuilding === b
                        ? 'bg-vku-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b === 'ALL' ? 'Tất cả tòa nhà' : b}
                  </button>
                ))}
              </div>

              {/* Secondary filters & search */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo phòng, cán bộ, ghi chú..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none bg-white"
                >
                  <option value="ALL">Tất cả mức độ tình trạng</option>
                  <option value="CRITICAL">Hư hỏng nghiêm trọng (Mức 1-2)</option>
                  <option value="WARNING">Cần bảo trì (Mức 3)</option>
                  <option value="GOOD">Tình trạng tốt (Mức 4-5)</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none bg-white"
                >
                  <option value="ALL">Tất cả hạng mục kiểm tra</option>
                  <option value="Hardware">Máy tính & Thiết bị CNTT</option>
                  <option value="Projector">Máy chiếu & Âm thanh</option>
                  <option value="AC">Điều hòa & Quạt mát</option>
                  <option value="Electrical">Hệ thống Điện & Chiếu sáng</option>
                  <option value="Furniture">Bàn ghế & Nội thất phòng</option>
                </select>
              </div>
            </div>

            {/* Surveys Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Ảnh</th>
                      <th className="py-3 px-4">Vị trí</th>
                      <th className="py-3 px-4">Hạng mục</th>
                      <th className="py-3 px-4">Tình trạng</th>
                      <th className="py-3 px-4">Mô tả sự cố / Hư hỏng</th>
                      <th className="py-3 px-4">Cán bộ</th>
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredSurveys.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          {loading ? 'Đang đồng bộ dữ liệu từ máy chủ...' : 'Không có biên bản nào phù hợp bộ lọc.'}
                        </td>
                      </tr>
                    ) : (
                      filteredSurveys.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4">
                            {s.photoUrl ? (
                              <button
                                type="button"
                                onClick={() => setPreviewPhoto({ url: s.photoUrl!, title: `${s.building} - ${s.room}` })}
                                className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:scale-105 transition-transform"
                              >
                                <img src={s.photoUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                              </button>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                <Camera className="w-4 h-4" />
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-slate-900">{s.building}</div>
                            <div className="text-[11px] text-slate-500">{s.floor} • Phòng {s.room}</div>
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-700">
                            {s.category}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                s.condition <= 2
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : s.condition === 3
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              ★ {s.condition}/5
                            </span>
                          </td>
                          <td className="py-2.5 px-4 max-w-xs truncate text-slate-600" title={s.defectNotes}>
                            {s.defectNotes || <span className="text-slate-400 italic">Không có ghi chú</span>}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-800">{s.inspectorName}</div>
                            <div className="text-[10px] text-slate-400">{s.inspectorId || 'N/A'}</div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                            {new Date(s.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {s.photoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewPhoto({ url: s.photoUrl!, title: `${s.building} - ${s.room}` })}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Xem ảnh"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteSurvey(s.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa biên bản"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Users Management View */}
        {activeAdminTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Danh Sách Tài Khoản Người Dùng</h2>
                <p className="text-xs text-slate-500">Quản lý phân quyền Cán bộ kiểm định và Quản trị viên</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                {users.length} tài khoản
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Họ và Tên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phân quyền</th>
                    <th className="py-3 px-4">Mã Cán Bộ</th>
                    <th className="py-3 px-4">Ngày Tạo</th>
                    <th className="py-3 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {u.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <Shield className="w-3 h-3" />
                            Quản trị viên
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <UserCheck className="w-3 h-3" />
                            Cán bộ kiểm định
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {u.inspectorId || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={u.email === currentUser?.email}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title={u.email === currentUser?.email ? 'Không thể xóa tài khoản hiện tại' : 'Xóa tài khoản'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold">{previewPhoto.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img src={previewPhoto.url} alt="Chi tiết hiện trường" className="max-h-[65vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-4 bg-vku-800 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold">Thêm Tài Khoản Mới</h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-3">
              {userError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {userError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn B"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nguyenvanb@vku.udn.vn"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phân quyền</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none bg-white"
                >
                  <option value="inspector">Cán bộ kiểm định (Inspector)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              {newRole === 'inspector' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã cán bộ (Tùy chọn)</label>
                  <input
                    type="text"
                    value={newInspectorId}
                    onChange={(e) => setNewInspectorId(e.target.value)}
                    placeholder="VKU-2025-XX"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-vku-600 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-vku-600 hover:bg-vku-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Lưu Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
