import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { deleteSurvey } from '../db/surveyRepository';
import { syncService } from '../services/syncService';
import { formatDateTime, formatRelativeTime } from '../utils/date';
import type { Survey, SurveyStatus } from '../types/survey';
import { useLanguage } from '../context/LanguageContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  RotateCw,
  Star,
  Building2,
  DoorOpen,
  Search,
  Filter
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

export const SurveyList: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const surveys = useLiveQuery(async () => {
    const list = await db.surveys.toArray();
    const sorted = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Enterprise Data Isolation:
    // Administrators can inspect all records.
    // Regular inspectors are strictly scoped to their own activity.
    if (currentUser?.role === 'admin') {
      return sorted;
    }

    return sorted.filter((s) => {
      if (currentUser?.email && s.createdByEmail) {
        return s.createdByEmail.toLowerCase() === currentUser.email.toLowerCase();
      }
      if (currentUser?.inspectorId && s.inspectorId) {
        return s.inspectorId === currentUser.inspectorId;
      }
      return s.inspectorName === currentUser?.fullName;
    });
  }, [currentUser?.id, currentUser?.role]);

  if (!surveys) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-vku-600 mb-2" />
        <p className="text-xs font-medium">{t.loadingData}</p>
      </div>
    );
  }

  const filtered = surveys.filter((s) => {
    const matchesFilter =
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDING' && (s.status === 'PENDING_SYNC' || s.status === 'SYNCING')) ||
      (filterStatus === 'SYNCED' && s.status === 'SYNCED') ||
      (filterStatus === 'FAILED' && s.status === 'FAILED');

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      s.building.toLowerCase().includes(query) ||
      s.room.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      s.defectNotes.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const handleDeleteRequest = (survey: Survey, e: React.MouseEvent) => {
    e.stopPropagation();
    setSurveyToDelete(survey);
  };

  const handleConfirmDelete = async () => {
    if (!surveyToDelete) return;
    try {
      await deleteSurvey(surveyToDelete.id);
      showToast({
        type: 'info',
        title: language === 'vi' ? 'Đã xóa biên bản' : 'Survey Deleted',
        message: `${surveyToDelete.building} • ${surveyToDelete.room}`
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: language === 'vi' ? 'Không thể xóa biên bản này' : 'Failed to delete survey'
      });
    } finally {
      setSurveyToDelete(null);
    }
  };

  const handleRetry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast({
      type: 'info',
      message: language === 'vi' ? 'Đang gửi lại biên bản...' : 'Retrying sync...'
    });
    await syncService.retrySingleSurvey(id);
  };

  const renderStatusBadge = (status: SurveyStatus) => {
    switch (status) {
      case 'PENDING_SYNC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            {t.badgePendingSync}
          </span>
        );
      case 'SYNCING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
            {t.badgeSyncing}
          </span>
        );
      case 'SYNCED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {t.badgeSynced}
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            {t.badgeFailed}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vku-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {[
            { key: 'ALL', label: t.filterAll.replace('{count}', String(surveys.length)) },
            {
              key: 'PENDING',
              label: t.filterPending.replace('{count}', String(surveys.filter((s) => s.status === 'PENDING_SYNC' || s.status === 'SYNCING').length))
            },
            { key: 'SYNCED', label: t.filterSynced.replace('{count}', String(surveys.filter((s) => s.status === 'SYNCED').length)) },
            { key: 'FAILED', label: t.filterFailed.replace('{count}', String(surveys.filter((s) => s.status === 'FAILED').length)) }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                filterStatus === f.key
                  ? 'bg-vku-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Survey Cards */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center bg-white">
          <p className="text-xs font-semibold text-slate-500">{t.emptyHistoryTitle}</p>
          <p className="text-[11px] text-slate-400 mt-1">{t.emptyHistorySubtitle}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              renderStatusBadge={renderStatusBadge}
              onDelete={handleDeleteRequest}
              onRetry={handleRetry}
              onOpenPhoto={(url) => setSelectedPhoto(url)}
            />
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img
              src={selectedPhoto}
              alt="Full inspection preview"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="mt-2 w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
            >
              {t.closePreview}
            </button>
          </div>
        </div>
      )}

      {/* Modern Custom Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(surveyToDelete)}
        title={language === 'vi' ? 'Xác nhận xóa biên bản?' : 'Delete Inspection Record?'}
        message={
          language === 'vi'
            ? 'Biên bản khảo sát này sẽ bị xóa vĩnh viễn khỏi bộ nhớ cục bộ của thiết bị.'
            : 'This field survey record will be permanently removed from device storage.'
        }
        itemDetails={
          surveyToDelete
            ? `${surveyToDelete.building} • ${surveyToDelete.floor} • ${surveyToDelete.room}`
            : undefined
        }
        confirmText={language === 'vi' ? 'Xóa biên bản' : 'Delete'}
        cancelText={language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setSurveyToDelete(null)}
      />
    </div>
  );
};

interface SurveyCardProps {
  survey: Survey;
  renderStatusBadge: (status: SurveyStatus) => React.ReactNode;
  onDelete: (survey: Survey, e: React.MouseEvent) => void;
  onRetry: (id: string, e: React.MouseEvent) => void;
  onOpenPhoto: (url: string) => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({
  survey,
  renderStatusBadge,
  onDelete,
  onRetry,
  onOpenPhoto
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(survey.photoUrl || null);
  const { t, language } = useLanguage();

  const categoryLabels: Record<string, string> = {
    Hardware: t.catHardware,
    Projector: t.catProjector,
    AC: t.catAC,
    Electrical: t.catElectrical,
    Furniture: t.catFurniture
  };

  React.useEffect(() => {
    if (survey.photo) {
      const url = URL.createObjectURL(survey.photo);
      setPhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (survey.photoUrl) {
      setPhotoUrl(survey.photoUrl);
    } else {
      setPhotoUrl(null);
    }
  }, [survey.photo, survey.photoUrl]);

  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
      {/* Top row: Building, room, photo thumbnail and status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
            <Building2 className="w-3.5 h-3.5 text-vku-600" />
            <span>{survey.building}</span>
            <span className="text-slate-300">•</span>
            <span>{survey.floor}</span>
            <span className="text-slate-300">•</span>
            <DoorOpen className="w-3.5 h-3.5 text-vku-600 ml-0.5" />
            <span className="text-vku-700">{survey.room}</span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
              {categoryLabels[survey.category] || survey.category}
            </span>
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < survey.condition ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            {survey.inspectorName && (
              <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                👤 {survey.inspectorName}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Status badge & Photo thumbnail */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {renderStatusBadge(survey.status)}
          {photoUrl && (
            <button
              type="button"
              onClick={() => onOpenPhoto(photoUrl)}
              className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-vku-200 hover:border-vku-500 shadow-2xs hover:scale-105 transition-all group shrink-0"
              title={language === 'vi' ? 'Nhấn để xem ảnh phóng to' : 'Click to enlarge photo'}
            >
              <img
                src={photoUrl}
                alt="Ảnh hiện trường"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Defect notes */}
      {survey.defectNotes && (
        <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
          {survey.defectNotes}
        </p>
      )}

      {/* Offline / Weak Network Note if PENDING_SYNC */}
      {survey.status === 'PENDING_SYNC' && survey.lastSyncError && (
        <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 p-2 rounded-lg flex items-start gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-semibold text-amber-900">{survey.lastSyncError}</span>
          </div>
        </div>
      )}

      {/* Sync Error Notice if FAILED */}
      {survey.status === 'FAILED' && survey.lastSyncError && (
        <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{t.syncErrorPrefix} </span>
            <span>{survey.lastSyncError}</span>
            {survey.syncAttempts > 0 && (
              <span className="text-slate-500 ml-1">
                {t.attemptsCount.replace('{count}', String(survey.syncAttempts))}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom row: timestamp, photo thumbnail, actions */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span title={formatDateTime(survey.createdAt)} className="font-medium text-slate-500">
            {formatRelativeTime(survey.createdAt)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">#{survey.id.slice(0, 8)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {photoUrl && (
            <button
              type="button"
              onClick={() => onOpenPhoto(photoUrl)}
              className="p-1 rounded-lg hover:bg-slate-100 text-vku-600 flex items-center gap-1 text-[11px] font-semibold"
              title={t.viewPhoto}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t.viewPhoto}</span>
            </button>
          )}

          {(survey.status === 'FAILED' || survey.status === 'PENDING_SYNC') && (
            <button
              type="button"
              onClick={(e) => onRetry(survey.id, e)}
              className="p-1 px-2 rounded-lg bg-vku-50 hover:bg-vku-100 text-vku-700 flex items-center gap-1 text-[11px] font-bold transition-colors"
              title={survey.status === 'FAILED' ? t.btnRetry : (language === 'vi' ? 'Đồng bộ ngay' : 'Sync Now')}
            >
              <RotateCw className="w-3 h-3" />
              <span>{survey.status === 'FAILED' ? t.btnRetry : (language === 'vi' ? 'Đồng bộ' : 'Sync')}</span>
            </button>
          )}

          {/* Business Logic: Admin can delete any local survey; Inspector can only delete unsynced drafts */}
          {(authService.getCurrentUser()?.role === 'admin' || survey.status === 'PENDING_SYNC' || survey.status === 'FAILED') && (
            <button
              type="button"
              onClick={(e) => onDelete(survey, e)}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              title={t.btnDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
