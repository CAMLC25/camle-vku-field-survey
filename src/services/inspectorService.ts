import type { InspectorProfile } from '../types/survey';

const STORAGE_KEY = 'vku_inspector_profile';

const DEFAULT_PROFILE: InspectorProfile = {
  name: 'ThS. Nguyễn Văn A',
  inspectorId: 'VKU-CB082',
  department: 'Tổ Quản trị Cơ sở vật chất'
};

class InspectorService {
  private listeners: Set<(profile: InspectorProfile) => void> = new Set();

  public getProfile(): InspectorProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading inspector profile:', e);
    }
    return DEFAULT_PROFILE;
  }

  public saveProfile(profile: InspectorProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      this.notify(profile);
    } catch (e) {
      console.error('Error saving inspector profile:', e);
    }
  }

  public subscribe(listener: (profile: InspectorProfile) => void): () => void {
    this.listeners.add(listener);
    listener(this.getProfile());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(profile: InspectorProfile) {
    this.listeners.forEach((fn) => {
      try {
        fn(profile);
      } catch (err) {
        console.error(err);
      }
    });
  }
}

export const inspectorService = new InspectorService();
