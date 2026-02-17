export interface JWTPayload {
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export * from './asignacion';
