export type UserRole = 'admin' | 'inspector';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  inspectorId?: string;
  createdAt: string;
  password?: string; // used internally for auth check
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}
