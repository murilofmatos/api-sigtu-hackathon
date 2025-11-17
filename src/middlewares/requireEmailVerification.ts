import { Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { AuthRequest } from '../types';
import { AppError } from './errorHandler';
import { asyncHandler } from './asyncHandler';

/**
 * Middleware opcional para exigir email verificado em rotas específicas
 * Use este middleware APÓS o middleware de autenticação
 */
export const requireEmailVerification = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const uid = req.user?.uid;

    if (!uid) {
      throw new AppError('Não autorizado', 401);
    }

    const userRecord = await auth().getUser(uid);

    if (!userRecord.emailVerified) {
      throw new AppError(
        'Email não verificado. Por favor, verifique seu email antes de acessar este recurso.',
        403
      );
    }

    next();
  }
);
