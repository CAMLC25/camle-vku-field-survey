import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastOptions & { id: string })[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions | string) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      const toastObj: ToastOptions & { id: string } =
        typeof options === 'string'
          ? { id, message: options, type: 'success', duration: 3500 }
          : {
              id,
              type: options.type || 'success',
              title: options.title,
              message: options.message,
              duration: options.duration || 3500
            };

      setToasts((prev) => [toastObj, ...prev.slice(0, 2)]); // Keep max 3 toasts

      if (toastObj.duration && toastObj.duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, toastObj.duration);
      }
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Container Top Center */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full p-3.5 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${
                isSuccess
                  ? 'bg-slate-900/95 text-white border-slate-700/80'
                  : isError
                  ? 'bg-rose-950/95 text-rose-100 border-rose-800'
                  : isWarning
                  ? 'bg-amber-950/95 text-amber-100 border-amber-800'
                  : 'bg-slate-900/95 text-white border-slate-700/80'
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-xs font-bold tracking-tight text-white mb-0.5">
                    {toast.title}
                  </p>
                )}
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {toast.message}
                </p>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => hideToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-white p-0.5 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
