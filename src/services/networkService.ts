import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

export type NetworkChangeCallback = (connected: boolean) => void;

class NetworkService {
  private isConnected = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<NetworkChangeCallback> = new Set();
  private initialized = false;

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
      this.notify(true);
    });

    window.addEventListener('offline', () => {
      this.notify(false);
    });
  }

  private notify(connected: boolean) {
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
    return navigator.onLine;
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
    // Immediately call with current status
    callback(this.isConnected);

    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const networkService = new NetworkService();
