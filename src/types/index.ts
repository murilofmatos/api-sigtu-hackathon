import { Request } from 'express';
import { UserRole } from './student';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: UserRole;
  };
}

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export interface AuthResponse {
  uid: string;
  email: string;
  token: string;
  role: UserRole;
  emailVerified?: boolean;
  verificationLink?: string; // Apenas para desenvolvimento
  profileCompleted?: boolean; // Para alunos
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}
