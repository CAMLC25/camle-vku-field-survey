import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { compressImage } from '../utils/image';

class CameraService {
  /**
   * Captures a photo using Capacitor Camera on native Android,
   * or falls back to HTML5 file input with camera capture on web.
   * Compresses the image and returns a lightweight Blob.
   */
  public async capturePhoto(): Promise<Blob | null> {
    if (Capacitor.isNativePlatform()) {
      return await this.captureNative();
    } else {
      return await this.captureWeb();
    }
  }

  /**
   * Native photo capture via @capacitor/camera
   */
  private async captureNative(): Promise<Blob | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Ảnh hiện trường khảo sát',
        promptLabelPhoto: 'Chọn ảnh từ thư viện',
        promptLabelPicture: 'Chụp ảnh bằng máy ảnh'
      });

      if (!image.webPath) {
        return null;
      }

      // Convert webPath (e.g. capacitor:// or file://) to Blob
      const response = await fetch(image.webPath);
      const rawBlob = await response.blob();

      // Compress to ensure efficient IndexedDB storage and rapid upload
      return await compressImage(rawBlob, 960, 0.65);
    } catch (err: any) {
      // User cancelled camera prompt or denied permission
      if (err?.message?.includes('User cancelled') || err?.message?.includes('canceled')) {
        console.log('User cancelled camera capture');
        return null;
      }
      console.warn('Native camera capture failed, attempting web fallback:', err);
      return await this.captureWeb();
    }
  }

  /**
   * Web fallback using hidden <input type="file" accept="image/*" capture="environment">
   */
  public async captureWeb(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      // Allows mobile browsers to directly trigger camera if supported
      input.setAttribute('capture', 'environment');
      input.style.display = 'none';

      let handled = false;

      const cleanup = () => {
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      };

      input.onchange = async () => {
        handled = true;
        const file = input.files?.[0];
        cleanup();

        if (!file) {
          resolve(null);
          return;
        }

        try {
          const compressed = await compressImage(file, 960, 0.65);
          resolve(compressed);
        } catch (err) {
          console.error('Failed to compress web captured image:', err);
          resolve(file);
        }
      };

      // Handle window focus/cancellation
      window.addEventListener(
        'focus',
        () => {
          setTimeout(() => {
            if (!handled) {
              cleanup();
              resolve(null);
            }
          }, 1000);
        },
        { once: true }
      );

      document.body.appendChild(input);
      input.click();
    });
  }
}

export const cameraService = new CameraService();
