import React, { useState, useEffect } from 'react';
import { Camera, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cameraService } from '../services/cameraService';
import { useLanguage } from '../context/LanguageContext';

interface PhotoCaptureProps {
  photo: Blob | null;
  photoUrl?: string | null;
  onChange: (photo: Blob | null, dataUrl?: string | null) => void;
  disabled?: boolean;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  photo,
  photoUrl = null,
  onChange,
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(photoUrl || null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (photoUrl) {
      setPreviewUrl(photoUrl);
      return;
    }

    if (!photo || photo.size === 0) {
      setPreviewUrl(null);
      return;
    }

    try {
      const url = URL.createObjectURL(photo);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch {
      setPreviewUrl(null);
    }
  }, [photo, photoUrl]);

  const handleCapture = async () => {
    if (disabled || loading) return;

    setLoading(true);
    try {
      const capturedBlob = await cameraService.capturePhoto();
      if (capturedBlob) {
        const dataUrl = (capturedBlob as any).dataUrl || null;
        onChange(capturedBlob, dataUrl);
      }
    } catch (err) {
      console.error('Photo capture error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, null);
  };

  const sizeKb = photo ? Math.round(photo.size / 1024) : 0;

  return (
    <div className="w-full">
      {previewUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm max-w-sm">
          <img
            src={previewUrl}
            alt="Captured inspection defect"
            className="w-full h-48 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Size badge */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            <span>{t.compressedBadge.replace('{size}', String(sizeKb))}</span>
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-md focus:outline-none"
            title={t.removePhoto}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleCapture}
          disabled={disabled || loading}
          className="w-full h-36 rounded-xl border-2 border-dashed border-slate-300 hover:border-vku-500 bg-slate-50 hover:bg-vku-50/50 transition-all flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-vku-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-vku-400"
        >
          {loading ? (
            <>
              <Loader2 className="w-8 h-8 text-vku-600 animate-spin" />
              <span className="text-xs font-semibold text-vku-700">{t.accessingCamera}</span>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-white shadow-xs border border-slate-200 group-hover:border-vku-300">
                <Camera className="w-6 h-6 text-vku-600" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-slate-700 block">{t.takePhotoOrChoose}</span>
                <span className="text-[11px] text-slate-400">{t.photoCompressedNotice}</span>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
};
