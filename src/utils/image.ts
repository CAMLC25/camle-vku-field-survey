/**
 * Compresses an image File or Blob to a maximum dimension (default 1280px) and JPEG quality (default 0.8).
 * Ensures memory-efficient IndexedDB storage and quick network synchronization.
 */
export async function compressImage(
  fileOrBlob: Blob,
  maxDimension = 1280,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If it's already small (< 150KB), no need to compress
    if (fileOrBlob.size < 150 * 1024) {
      return resolve(fileOrBlob);
    }

    const objectUrl = URL.createObjectURL(fileOrBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(fileOrBlob);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < fileOrBlob.size) {
            resolve(blob);
          } else {
            resolve(fileOrBlob);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression: ' + err));
    };

    img.src = objectUrl;
  });
}

/**
 * Creates an object URL for a Blob and provides an auto-cleanup helper.
 */
export function createBlobUrl(blob: Blob | null): string | null {
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
