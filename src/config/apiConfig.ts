// Cloudflare backend endpoint for central persistence and synchronization
export const CLOUDFLARE_BACKEND_URL = 'https://camle-vku-field-survey.lecam.workers.dev';

/**
 * Resolves the appropriate API base URL depending on execution runtime:
 * - Always points to the central Cloudflare Worker KV backend for seamless cross-device synchronization.
 * - Allows override via VITE_API_URL environment variable if provided.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  return CLOUDFLARE_BACKEND_URL;
}
