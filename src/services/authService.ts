import type { User, UserRole, AuthSession } from '../types/user';
import { inspectorService } from './inspectorService';
import { getApiBaseUrl } from '../config/apiConfig';

const SESSION_KEY = 'vku_survey_session';
const USERS_KEY = 'vku_survey_users';

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin',
    email: 'admin@vku.udn.vn',
    fullName: 'Quản Trị Viên VKU',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00.000Z',
    password: 'admin123'
  },
  {
    id: 'usr-inspector',
    email: 'canbo@vku.udn.vn',
    fullName: 'Lê Cảm (Cán bộ)',
    role: 'inspector',
    inspectorId: 'VKU-2025-01',
    createdAt: '2025-01-01T00:00:00.000Z',
    password: '123456'
  }
];

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.initLocalUsers();
    this.loadSession();
  }

  private initLocalUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return parsed;
    } catch {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
  }

  private getLocalUsers(): User[] {
    return this.initLocalUsers();
  }

  private saveLocalUsers(users: User[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private loadSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const session: AuthSession = JSON.parse(raw);
        if (session.expiresAt > Date.now()) {
          this.currentUser = session.user;
          this.syncInspectorProfile(session.user);
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }
  }

  private syncInspectorProfile(user: User) {
    if (user.role === 'admin') {
      inspectorService.saveProfile({
        name: user.fullName || 'Quản Trị Viên VKU',
        inspectorId: user.inspectorId || 'ADMIN-01',
        department: 'Ban Quản Trị Hệ Thống VKU'
      });
    } else {
      inspectorService.saveProfile({
        name: user.fullName,
        inspectorId: user.inspectorId || 'VKU-INSP',
        department: 'Tổ Khảo Sát Hiện Trường VKU'
      });
    }
  }

  public subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    for (const l of this.listeners) {
      l(this.currentUser);
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public async login(email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try online server login first
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          this.setSession(data.user);
          return { success: true, user: data.user };
        }
      }
    } catch (apiErr) {
      console.warn('[AuthService] Server login unavailable, attempting offline login fallback:', apiErr);
    }

    // 2. Offline Fallback from local storage
    const users = this.getLocalUsers();
    const matched = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matched) {
      return { success: false, message: 'Tài khoản không tồn tại trong hệ thống.' };
    }

    if (matched.password && matched.password !== password) {
      return { success: false, message: 'Mật khẩu không chính xác.' };
    }

    // Create sanitized user object
    const sanitizedUser: User = {
      id: matched.id,
      email: matched.email,
      fullName: matched.fullName,
      role: matched.role,
      inspectorId: matched.inspectorId,
      createdAt: matched.createdAt
    };

    this.setSession(sanitizedUser);
    return { success: true, user: sanitizedUser };
  }

  public async createUser(params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    inspectorId?: string;
  }): Promise<{ success: boolean; user?: User; message?: string }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const newUser: User = {
      id: 'usr-' + Date.now(),
      email: cleanEmail,
      fullName: params.fullName.trim(),
      role: params.role,
      inspectorId: params.inspectorId?.trim() || (params.role === 'inspector' ? `VKU-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      createdAt: new Date().toISOString(),
      password: params.password
    };

    // 1. Save locally immediately
    const users = this.getLocalUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email này đã được cấp tài khoản.' };
    }

    users.push(newUser);
    this.saveLocalUsers(users);

    // 2. Attempt to sync with Server (Cloudflare KV)
    try {
      await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    } catch (err) {
      console.warn('[AuthService] Saved user locally, server sync deferred:', err);
    }

    const sanitized: User = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      inspectorId: newUser.inspectorId,
      createdAt: newUser.createdAt
    };

    return { success: true, user: sanitized };
  }

  public async register(params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    inspectorId?: string;
  }): Promise<{ success: boolean; user?: User; message?: string }> {
    const res = await this.createUser(params);
    if (res.success && res.user) {
      this.setSession(res.user);
    }
    return res;
  }

  public async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/users`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Merge with local users
          this.saveLocalUsers(data.data);
          return data.data;
        }
      }
    } catch (err) {
      console.warn('[AuthService] Using local user directory:', err);
    }
    return this.getLocalUsers().map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      inspectorId: u.inspectorId,
      createdAt: u.createdAt
    }));
  }

  public async deleteUser(id: string): Promise<boolean> {
    const current = this.getLocalUsers();
    const filtered = current.filter(u => u.id !== id);
    this.saveLocalUsers(filtered);

    try {
      await fetch(`${getApiBaseUrl()}/api/users/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete on server:', e);
    }
    return true;
  }

  private setSession(user: User) {
    this.currentUser = user;
    this.syncInspectorProfile(user);
    const session: AuthSession = {
      user,
      token: 'jwt-vku-' + Math.random().toString(36).substring(2),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days offline TTL
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.notify();

    // Dynamically pull user's cloud records into local IndexedDB
    import('./syncService').then(({ syncService }) => {
      syncService.pullSurveysFromCloud().catch(() => {});
    });
  }

  public logout() {
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    this.notify();
  }
}

export const authService = new AuthService();
