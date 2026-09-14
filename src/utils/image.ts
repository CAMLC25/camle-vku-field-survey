/**
 * Image compression and WebKit-safe Data URL utilities for VKU Field Survey.
 * Solves iOS Safari IndexedDB Blob deletion/zero-byte bugs by maintaining
 * both binary Blobs and durable Base64 Data URL strings.
 */

export interface CompressResult {
  blob: Blob;
  dataUrl: string;
}

/**
 * Converts a base64 Data URL string to a standard binary Blob.
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binaryStr = atob(parts[1]);
  const len = binaryStr.length;
  const u8arr = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryStr.charCodeAt(i);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * Converts a Blob to a base64 Data URL string via FileReader.
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Compresses an image File or Blob to a maximum dimension (default 960px) and JPEG quality (default 0.65).
 * Generates both a binary Blob and a durable Data URL string in one pass.
 * Typical output size: 40KB - 85KB (drastically speeds up iOS uploads and prevents UI freezes).
 */
export async function compressImageWithDataUrl(
  fileOrBlob: Blob,
  maxDimension = 960,
  quality = 0.65
): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
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
        blobToDataURL(fileOrBlob).then((dataUrl) => {
          resolve({ blob: fileOrBlob, dataUrl });
        }).catch(() => {
          resolve({ blob: fileOrBlob, dataUrl: '' });
        });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const blob = dataURLtoBlob(dataUrl);
        resolve({ blob, dataUrl });
      } catch (err) {
        canvas.toBlob(
          async (b) => {
            const finalBlob = b || fileOrBlob;
            const dataUrl = await blobToDataURL(finalBlob).catch(() => '');
            resolve({ blob: finalBlob, dataUrl });
          },
          'image/jpeg',
          quality
        );
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression: ' + err));
    };

    img.src = objectUrl;
  });
}

/**
 * Backwards-compatible compressImage function returning a Blob with attached dataUrl.
 */
export async function compressImage(
  fileOrBlob: Blob,
  maxDimension = 960,
  quality = 0.65
): Promise<Blob> {
  const result = await compressImageWithDataUrl(fileOrBlob, maxDimension, quality);
  (result.blob as any).dataUrl = result.dataUrl;
  return result.blob;
}

/**
 * Helper to safely create an object URL with null checking.
 */
export function createBlobUrl(blob: Blob | null): string | null {
  if (!blob || blob.size === 0) return null;
  try {
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
