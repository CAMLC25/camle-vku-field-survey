import React, { useState, useEffect } from 'react';
import { Building2, Layers, DoorOpen, Tag, FileText, CheckCircle2, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { SURVEY_CATEGORIES, type SurveyCategory, type InspectorProfile } from '../types/survey';
import { createSurvey } from '../db/surveyRepository';
import { syncService } from '../services/syncService';
import { networkService } from '../services/networkService';
import { inspectorService } from '../services/inspectorService';
import { authService } from '../services/authService';
import { ConditionRating } from './ConditionRating';
import { PhotoCapture } from './PhotoCapture';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface SurveyFormProps {
  onSuccess?: (surveyId: string) => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ onSuccess }) => {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();
  const defaultProfile: InspectorProfile = {
    name: currentUser?.fullName || 'Cán bộ khảo sát',
    inspectorId: currentUser?.inspectorId || (currentUser?.role === 'admin' ? 'ADMIN-01' : 'VKU-INSP'),
    department: currentUser?.role === 'admin' ? 'Ban Quản Trị Hệ Thống VKU' : 'Tổ Khảo Sát Hiện Trường VKU'
  };
  const [inspector, setInspector] = useState<InspectorProfile>(defaultProfile);

  useEffect(() => {
    return inspectorService.subscribe((p) => {
      // Prioritize live auth profile if available
      const liveUser = authService.getCurrentUser();
      if (liveUser) {
        setInspector({
          name: liveUser.fullName,
          inspectorId: liveUser.inspectorId || (liveUser.role === 'admin' ? 'ADMIN-01' : 'VKU-INSP'),
          department: liveUser.role === 'admin' ? 'Ban Quản Trị Hệ Thống VKU' : 'Tổ Khảo Sát Hiện Trường VKU'
        });
      } else {
        setInspector(p);
      }
    });
  }, []);

  const BUILDINGS = [
    { code: 'V', label: 'Khu V', fullVi: 'Khu V', fullEn: 'Building V', desc: 'Hiệu bộ & Đa năng' },
    { code: 'K', label: 'Khu K', fullVi: 'Khu K', fullEn: 'Building K', desc: 'Kỹ thuật & Lab' },
    { code: 'A', label: 'Khu A', fullVi: 'Khu A', fullEn: 'Building A', desc: 'Giảng đường' },
    { code: 'B', label: 'Khu B', fullVi: 'Khu B', fullEn: 'Building B', desc: 'Thực hành' },
  ];

  const FLOORS = [1, 2, 3, 4, 5]; // 5 floors, strictly no ground floor

  const [buildingCode, setBuildingCode] = useState<string>('V');
  const [building, setBuilding] = useState<string>(language === 'vi' ? 'Khu V' : 'Building V');
  const [floorNum, setFloorNum] = useState<number>(1);
  const [floor, setFloor] = useState<string>(language === 'vi' ? 'Tầng 1' : 'Floor 1');
  const [room, setRoom] = useState<string>('V.101');
  const [isCustomRoom, setIsCustomRoom] = useState<boolean>(false);
  const [category, setCategory] = useState<SurveyCategory>('Hardware');
  const [condition, setCondition] = useState<number>(3);
  const [defectNotes, setDefectNotes] = useState('');
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 10 rooms dynamically calculated for current building and floor
  const floorRooms = Array.from({ length: 10 }, (_, i) => {
    const numStr = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
    return `${buildingCode}.${floorNum}${numStr}`;
  });

  const handleSelectBuilding = (code: string) => {
    setBuildingCode(code);
    const bObj = BUILDINGS.find((b) => b.code === code);
    const newBuilding = language === 'vi' ? bObj?.fullVi || code : bObj?.fullEn || code;
    setBuilding(newBuilding);

    if (!isCustomRoom) {
      const match = room.match(/^[A-Z]\.(\d+)/);
      if (match) {
        setRoom(`${code}.${match[1]}`);
      } else {
        setRoom(`${code}.${floorNum}01`);
      }
    }
    if (errors.building) setErrors((prev) => ({ ...prev, building: '' }));
  };

  const handleSelectFloor = (f: number) => {
    setFloorNum(f);
    const newFloor = language === 'vi' ? `Tầng ${f}` : `Floor ${f}`;
    setFloor(newFloor);

    if (!isCustomRoom) {
      const match = room.match(/^[A-Z]\.\d(\d{2})/);
      const roomSuffix = match ? match[1] : '01';
      setRoom(`${buildingCode}.${f}${roomSuffix}`);
    }
    if (errors.floor) setErrors((prev) => ({ ...prev, floor: '' }));
  };

  const handleSelectRoom = (r: string) => {
    setRoom(r);
    setIsCustomRoom(false);
    if (errors.room) setErrors((prev) => ({ ...prev, room: '' }));
  };

  const categoryLabels: Record<SurveyCategory, string> = {
    Hardware: t.catHardware,
    Projector: t.catProjector,
    AC: t.catAC,
    Electrical: t.catElectrical,
    Furniture: t.catFurniture
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!building.trim()) newErrors.building = t.validationBuildingRequired;
    if (!floor.trim()) newErrors.floor = t.validationFloorRequired;
    if (!room.trim()) newErrors.room = t.validationRoomRequired;
    if (!category) newErrors.category = t.validationCategoryRequired;
    if (!condition || condition < 1 || condition > 5) {
      newErrors.condition = t.validationConditionRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      // 1. Save survey locally to IndexedDB as source of truth
      const liveUser = authService.getCurrentUser();
      const created = await createSurvey({
        building: building.trim(),
        floor: floor.trim(),
        room: room.trim(),
        category,
        condition,
        defectNotes: defectNotes.trim(),
        photo,
        photoUrl: photoDataUrl || undefined,
        inspectorName: inspector.name,
        inspectorId: inspector.inspectorId,
        createdByEmail: liveUser?.email || ''
      });

      // 2. Non-blocking background sync registration & auto-sync trigger
      // On iOS Safari / Offline, syncService will safely queue or gracefully defer
      syncService.requestBackgroundSync().catch(() => {});
      if (networkService.isCurrentConnected()) {
        syncService.syncPendingSurveys().catch(() => {});
      }

      setSuccessMessage(t.surveySavedSuccess.replace('{id}', created.id.slice(0, 8)));
      showToast({
        type: 'success',
        title: language === 'vi' ? 'Đã lập biên bản khảo sát' : 'Inspection Recorded',
        message: `${building} • ${room} • #${created.id.slice(0, 8)}`
      });

      // Reset form fields
      setBuildingCode('V');
      setBuilding(language === 'vi' ? 'Khu V' : 'Building V');
      setFloorNum(1);
      setFloor(language === 'vi' ? 'Tầng 1' : 'Floor 1');
      setRoom('V.101');
      setIsCustomRoom(false);
      setDefectNotes('');
      setPhoto(null);
      setPhotoDataUrl(null);
      setCondition(3);
      setErrors({});

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(created.id);
        }, 1200);
      }
    } catch (err: any) {
      console.error('Failed to save survey:', err);
      setErrors({ form: err?.message || 'Failed to save survey to IndexedDB' });
      showToast({
        type: 'error',
        title: language === 'vi' ? 'Lỗi lưu biên bản' : 'Save Error',
        message: err?.message || 'Failed to save survey'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Inspector Identification Attribution Card */}
      <div className="px-3.5 py-2.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              {language === 'vi' ? 'Cán bộ lập biên bản' : 'Assigned Inspector'}
            </p>
            <p className="text-xs font-extrabold text-slate-900">
              {inspector.name}{' '}
              <span className="text-[11px] font-mono text-slate-500 font-semibold">({inspector.inspectorId})</span>
            </p>
          </div>
        </div>
        <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">
          {inspector.department}
        </span>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-300 text-emerald-800 flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">{t.formHeaderTitle}</h4>
            <p className="text-xs mt-0.5">{successMessage}</p>
            <p className="text-[11px] text-emerald-600 mt-1">
              {t.surveySavedNotice}
            </p>
          </div>
        </div>
      )}

      {errors.form && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-300 text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-medium">{errors.form}</p>
        </div>
      )}

      {/* Synchronized Campus Location Selector (1-Tap Fast Selection) */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4 shadow-2xs">
        {/* 1. Tòa nhà / Khu vực (4 Khuôn viên VKU) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-vku-600" />
              <span>{t.fieldBuilding}</span> <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-bold text-vku-700">{building}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {BUILDINGS.map((b) => {
              const isSelected = buildingCode === b.code;
              return (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => handleSelectBuilding(b.code)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border active:scale-95 ${
                    isSelected
                      ? 'bg-vku-600 text-white border-vku-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs">{b.label}</span>
                  <span className={`text-[9px] font-medium truncate ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                    {b.desc}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.building && <p className="text-rose-600 text-xs font-medium">{errors.building}</p>}
        </div>

        {/* 2. Tầng (5 Tầng, không có tầng trệt) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-vku-600" />
              <span>{t.fieldFloor}</span> <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-bold text-vku-700">{floor}</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {FLOORS.map((f) => {
              const isSelected = floorNum === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleSelectFloor(f)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border active:scale-95 ${
                    isSelected
                      ? 'bg-vku-600 text-white border-vku-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span>{language === 'vi' ? `Tầng ${f}` : `Fl. ${f}`}</span>
                </button>
              );
            })}
          </div>
          {errors.floor && <p className="text-rose-600 text-xs font-medium">{errors.floor}</p>}
        </div>

        {/* 3. Phòng / Vị trí (10 phòng mỗi tầng, đồng bộ tự động) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5 text-vku-600" />
              <span>{t.fieldRoom}</span> <span className="text-rose-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsCustomRoom(!isCustomRoom);
                if (!isCustomRoom) {
                  setRoom('');
                } else {
                  setRoom(`${buildingCode}.${floorNum}01`);
                }
              }}
              className="text-[11px] font-semibold text-vku-600 hover:text-vku-800 underline flex items-center gap-1"
            >
              <span>{isCustomRoom ? (language === 'vi' ? '← Chọn nhanh 10 phòng' : '← Select from 10 rooms') : (language === 'vi' ? '✏️ Tự nhập phòng khác' : '✏️ Custom room')}</span>
            </button>
          </div>

          {!isCustomRoom ? (
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {floorRooms.map((r) => {
                const isSelected = room === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSelectRoom(r)}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center border active:scale-95 ${
                      isSelected
                        ? 'bg-vku-600 text-white border-vku-600 shadow-xs ring-2 ring-vku-300 ring-offset-1'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-vku-300 hover:bg-vku-50/50'
                    }`}
                  >
                    <span>{r}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1 animate-fadeIn">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder={t.roomPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-vku-500 focus:outline-none focus:ring-2 focus:ring-vku-200 bg-white"
                autoFocus
              />
              <p className="text-[11px] text-slate-400">
                {language === 'vi' ? 'Nhập tên vị trí đặc biệt (ví dụ: Hội trường, Phòng Lab IoT, Phòng Server...)' : 'Enter custom location (e.g. Server Room, IoT Lab...)'}
              </p>
            </div>
          )}

          {errors.room && <p className="text-rose-600 text-xs font-medium">{errors.room}</p>}

          {/* Location Summary Chip */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60 mt-2">
            <span>{language === 'vi' ? 'Vị trí kiểm tra:' : 'Inspecting:'}</span>
            <span className="font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {building} • {floor} • <span className="text-vku-700 font-mono">{room || '...'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-vku-600" />
          {t.fieldCategory} <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SURVEY_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center leading-tight ${
                  isSelected
                    ? 'bg-vku-600 border-vku-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="text-rose-600 text-xs font-medium">{errors.category}</p>}
      </div>

      {/* Condition Rating */}
      <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-100/70 border border-slate-200">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>{t.fieldCondition} <span className="text-rose-500">*</span></span>
          <span className="text-[11px] font-normal text-slate-500">{t.conditionScale}</span>
        </label>
        <ConditionRating value={condition} onChange={setCondition} />
        {errors.condition && <p className="text-rose-600 text-xs font-medium">{errors.condition}</p>}
      </div>

      {/* Defect Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-vku-600" />
          {t.fieldDefectNotes} <span className="text-slate-400 font-normal lowercase">{t.optionalLabel}</span>
        </label>
        <textarea
          rows={3}
          value={defectNotes}
          onChange={(e) => setDefectNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium transition-all focus:border-vku-500 focus:outline-none focus:ring-2 focus:ring-vku-200 bg-white resize-none"
        />
      </div>

      {/* Photo Capture */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>{t.fieldPhoto} <span className="text-slate-400 font-normal lowercase">{t.optionalLabel}</span></span>
          <span className="text-[11px] font-normal text-slate-500">{t.photoStoredLocally}</span>
        </label>
        <PhotoCapture
          photo={photo}
          photoUrl={photoDataUrl}
          onChange={(b, dUrl) => {
            setPhoto(b);
            setPhotoDataUrl(dUrl || (b as any)?.dataUrl || null);
          }}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 rounded-xl bg-vku-600 hover:bg-vku-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-vku-300 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            <span>{t.btnSaving}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>{t.btnSaveSurvey}</span>
          </>
        )}
      </button>
    </form>
  );
};
