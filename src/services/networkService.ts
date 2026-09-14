import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { checkServerHealth } from './api';

export type NetworkChangeCallback = (connected: boolean) => void;

class NetworkService {
  private isConnected = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<NetworkChangeCallback> = new Set();
  private initialized = false;
  private lastVerificationTime = 0;

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
  }

  private setupWebListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      // On iOS WebKit, online event can fire prematurely before radio is ready
      this.verifyConnectivity();
    });

    window.addEventListener('offline', () => {
      this.notify(false);
    });

    // iOS PWA Standalone lifecycle events (resuming app from Home Screen)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.verifyConnectivity();
        }
      });
    }

    window.addEventListener('pageshow', () => {
      this.verifyConnectivity();
    });

    window.addEventListener('focus', () => {
      this.verifyConnectivity();
    });
  }

  /**
   * Actively checks if internet packets actually reach the server.
   * Solves iOS Safari false-positive "navigator.onLine === true" when signal is dead or captive.
   */
  public async verifyConnectivity(): Promise<boolean> {
    const now = Date.now();
    // Throttle checks to once every 2 seconds
    if (now - this.lastVerificationTime < 2000) {
      return this.isConnected;
    }
    this.lastVerificationTime = now;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.notify(false);
      return false;
    }

    const healthy = await checkServerHealth();
    this.notify(healthy);
    return healthy;
  }

  /**
   * Allows services (like SyncService) to immediately report a network drop,
   * keeping the UI state synchronized without waiting for browser events.
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
    if (this.isConnected === connected && this.listeners.size > 0) return;
    this.isConnected = connected;
    this.listeners.forEach((callback) => {
      try {
        callback(connected);
      } catch (err) {
        console.error('Error in network listener callback:', err);
      }
    });
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
        return navigator.onLine;
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

