import { Capacitor } from '@capacitor/core';

// Cloudflare backend endpoint for central persistence and synchronization
export const CLOUDFLARE_BACKEND_URL = 'https://camle-vku-field-survey.lecam.workers.dev';

/**
 * Resolves the appropriate API base URL depending on execution runtime:
 * - On Native Android/iOS via Capacitor (origin is https://localhost): Points directly to the remote Cloudflare Worker.
 * - On Web PWA (served from domain or Vite proxy): Uses relative path or VITE_API_URL.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  // Detect Capacitor native platform or Android/iOS localhost scheme
  if (Capacitor.isNativePlatform()) {
    return CLOUDFLARE_BACKEND_URL;
  }

  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.protocol === 'https:') {
    // Android WebView running under androidScheme: 'https' on localhost
    return CLOUDFLARE_BACKEND_URL;
  }

  return '';
}
