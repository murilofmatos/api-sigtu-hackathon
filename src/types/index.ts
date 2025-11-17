import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
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
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
