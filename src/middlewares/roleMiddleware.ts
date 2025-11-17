import { Response, NextFunction } from 'express';
import { firestore } from '../config/firebase';
import { AuthRequest } from '../types';
import { UserRole } from '../types/student';
import { AppError } from './errorHandler';
import { asyncHandler } from './asyncHandler';

/**
 * Middleware para verificar se o usuário tem o role necessário
 * Deve ser usado APÓS o middleware de autenticação
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const uid = req.user?.uid;

      if (!uid) {
        throw new AppError('Não autorizado', 401);
      }

      // Buscar role do usuário no Firestore
      const userDoc = await firestore().collection('users').doc(uid).get();
      const userData = userDoc.data();

      if (!userData) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const userRole = userData.role as UserRole;

      if (!allowedRoles.includes(userRole)) {
        throw new AppError(
          `Acesso negado. Esta rota requer um dos seguintes roles: ${allowedRoles.join(', ')}`,
          403
        );
      }

      // Adicionar role ao request para uso posterior
      req.user!.role = userRole;

      next();
    }
  );
};

/**
 * Middleware para verificar se o perfil do aluno foi completado
 * Só faz sentido para usuários com role 'student'
 */
export const requireProfileCompleted = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const uid = req.user?.uid;
    const role = req.user?.role;

    if (!uid) {
      throw new AppError('Não autorizado', 401);
    }

    // Verificar se é aluno
    if (role !== 'student') {
      // Se não for aluno, pular esta verificação
      return next();
    }

    // Buscar dados do usuário
    const userDoc = await firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!userData.profileCompleted) {
      throw new AppError(
        'Perfil incompleto. Por favor, complete seu perfil antes de acessar este recurso.',
        403
      );
    }

    next();
  }
);
