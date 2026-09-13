import React from 'react';
import { Trash2, AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemDetails?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  itemDetails,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon Halo */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 shadow-inner ${
              isDanger
                ? 'bg-rose-50 text-rose-600 border border-rose-100 ring-4 ring-rose-50/50'
                : isWarning
                ? 'bg-amber-50 text-amber-600 border border-amber-100 ring-4 ring-amber-50/50'
                : 'bg-blue-50 text-vku-600 border border-blue-100 ring-4 ring-blue-50/50'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-7 h-7 animate-bounce" />
            ) : isWarning ? (
              <AlertTriangle className="w-7 h-7" />
            ) : (
              <Info className="w-7 h-7" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>

          {/* Item Details pill if provided */}
          {itemDetails && (
            <div className="mt-2 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 font-mono inline-block">
              {itemDetails}
            </div>
          )}

          {/* Message */}
          <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-[260px]">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full py-2.5 px-3 rounded-xl text-white text-xs font-bold shadow-md transition-all active:scale-95 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                : 'bg-vku-600 hover:bg-vku-700 shadow-vku-600/25'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
