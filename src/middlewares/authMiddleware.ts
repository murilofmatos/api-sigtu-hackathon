import { Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { AuthRequest } from '../types';
import { AppError } from './errorHandler';
import { asyncHandler } from './asyncHandler';

export const authenticate = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token não fornecido', 401);
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      throw new AppError('Token inválido', 401);
    }

    try {
      const decodedToken = await auth().verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };

      next();
    } catch (error) {
      throw new AppError('Token inválido ou expirado', 401);
    }
  }
);
