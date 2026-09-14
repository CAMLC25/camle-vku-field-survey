import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { checkServerHealth } from './api';

export type NetworkChangeCallback = (connected: boolean) => void;

class NetworkService {
  private isConnected = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<NetworkChangeCallback> = new Set();
  private initialized = false;
  private lastVerificationTime = 0;
  private heartbeatInterval: any = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized) return;
    this.initialized = true;

    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Network.getStatus();
        this.isConnected = status.connected;

        Network.addListener('networkStatusChange', (status) => {
          this.notify(status.connected);
        });
      } catch (e) {
        console.warn('Failed to initialize Capacitor Network plugin, using web fallback:', e);
        this.setupWebListeners();
      }
    } else {
      this.setupWebListeners();
    }

    // Start proactive heartbeat polling to solve iOS WebKit stale navigator.onLine issue
    this.startHeartbeat();
  }

  private setupWebListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.verifyConnectivity(true);
    });

    window.addEventListener('offline', () => {
      this.notify(false);
    });

    // iOS PWA Standalone lifecycle events (resuming app from iOS Home Screen or unlocking)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.verifyConnectivity(true);
        }
      });
    }

    window.addEventListener('pageshow', () => {
      this.verifyConnectivity(true);
    });

    window.addEventListener('focus', () => {
      this.verifyConnectivity(true);
    });

    // iOS Standalone PWA Touch-Wakeup: when offline, any user touch/tap on the screen
    // immediately probes the network, solving iOS WebKit silent network reconnection
    const handleTouchWakeup = () => {
      if (!this.isConnected) {
        this.verifyConnectivity(true);
      }
    };
    window.addEventListener('touchstart', handleTouchWakeup, { passive: true });
    window.addEventListener('click', handleTouchWakeup, { passive: true });
  }

  /**
   * Proactive heartbeat polling (every 3 seconds when offline/recovering, 6 seconds when online).
   * Essential for iOS PWA: when mobile network drops and reconnects while remaining in the app,
   * WebKit DOES NOT update navigator.onLine or fire 'online' event reliably.
   * This periodic ping guarantees auto-recovery immediately upon network restoration.
   */
  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.heartbeatInterval = setInterval(async () => {
      // If app is in the background, only throttle, don't completely halt verification
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      // If browser explicitly says offline, mark false directly without hanging fetch
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.notify(false);
        return;
      }

      const isHealthy = await checkServerHealth();
      this.notify(isHealthy);
    }, 3000);
  }

  /**
   * Actively checks if internet packets actually reach the server.
   * @param force If true, bypasses throttle and runs immediately.
   */
  public async verifyConnectivity(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && now - this.lastVerificationTime < 2500) {
      return this.isConnected;
    }
    this.lastVerificationTime = now;

    // Do NOT short-circuit on !navigator.onLine for iOS WebKit!
    // Instead, actually probe the server endpoint.
    const healthy = await checkServerHealth();
    this.notify(healthy);
    return healthy;
  }

  /**
   * Immediately reports a network failure caught during an active fetch.
   */
  public reportNetworkFailure() {
    this.notify(false);
  }

  public reportNetworkSuccess() {
    if (!this.isConnected) {
      this.notify(true);
    }
  }

  private notify(connected: boolean) {
    const previousState = this.isConnected;
    if (previousState === connected) return;
    this.isConnected = connected;

    this.listeners.forEach((callback) => {
      try {
        callback(connected);
      } catch (err) {
        console.error('Error in network listener callback:', err);
      }
    });

    if (!previousState && connected) {
      console.log('[NetworkService] Connectivity successfully restored.');
    }
  }

  /**
   * Returns current connectivity state.
   */
  public async getStatus(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Network.getStatus();
        return status.connected;
      } catch {
        return this.isConnected;
      }
    }
    return this.isConnected;
  }

  /**
   * Synchronous check of latest cached connectivity status.
   */
  public isCurrentConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Subscribe to network changes. Returns unsubscribe function.
   */
  public addListener(callback: NetworkChangeCallback): () => void {
    this.listeners.add(callback);
    callback(this.isConnected);

    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const networkService = new NetworkService();
