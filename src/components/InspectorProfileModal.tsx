import React, { useState, useEffect } from 'react';
import { User, Shield, Building, Check, X, Award } from 'lucide-react';
import { inspectorService } from '../services/inspectorService';
import { useLanguage } from '../context/LanguageContext';
import type { InspectorProfile } from '../types/survey';

interface InspectorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InspectorProfileModal: React.FC<InspectorProfileModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<InspectorProfile>(inspectorService.getProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(inspectorService.getProfile());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inspectorService.saveProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const isVi = language === 'vi';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-vku-800 to-vku-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {isVi ? 'Hồ Sơ Cán Bộ Kiểm Định' : 'Inspector Profile'}
              </h3>
              <p className="text-[11px] text-blue-100 font-medium">
                {isVi ? 'Thông tin ký nhận biên bản khảo sát hiện trường' : 'Field inspection signature credentials'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-vku-600" />
              <span>{isVi ? 'Họ và tên Cán bộ' : 'Full Name'}</span>
            </label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder={isVi ? 'VD: ThS. Nguyễn Văn A' : 'e.g. John Doe'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-vku-500 focus:bg-white transition-all"
            />
          </div>

          {/* Staff ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-vku-600" />
              <span>{isVi ? 'Mã số Cán bộ / Thẻ kiểm định' : 'Inspector ID / Badge'}</span>
            </label>
            <input
              type="text"
              required
              value={profile.inspectorId}
              onChange={(e) => setProfile({ ...profile, inspectorId: e.target.value })}
              placeholder={isVi ? 'VD: VKU-CB082' : 'e.g. VKU-CB082'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-vku-500 focus:bg-white transition-all"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-vku-600" />
              <span>{isVi ? 'Đơn vị / Khoa phòng phụ trách' : 'Department / Division'}</span>
            </label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              placeholder={isVi ? 'VD: Tổ Quản trị Cơ sở vật chất' : 'e.g. Facility Management Office'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-vku-500 focus:bg-white transition-all"
            />
          </div>

          {/* Hint */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 leading-relaxed">
            <span className="font-bold">{isVi ? 'Ghi chú nghiệp vụ:' : 'Note:'}</span>{' '}
            {isVi 
              ? 'Hồ sơ được lưu cục bộ trên thiết bị và tự động đính kèm vào mọi biên bản khảo sát hiện trường kể cả khi không có mạng.'
              : 'Credentials are stored locally and automatically attached to all field inspection reports offline.'}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {isVi ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-vku-600 hover:bg-vku-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{isVi ? 'Đã lưu!' : 'Saved!'}</span>
                </>
              ) : (
                <span>{isVi ? 'Lưu thông tin' : 'Save Profile'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
