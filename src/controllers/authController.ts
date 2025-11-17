import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../middlewares/asyncHandler';
import { AuthRequest } from '../types';

export class AuthController {
  /**
   * POST /api/auth/register
   * Registra um novo usuário
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    const result = await AuthService.register({ email, password, name, role });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Usuário registrado com sucesso',
    });
  });

  /**
   * POST /api/auth/login
   * Faz login de um usuário
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login realizado com sucesso',
    });
  });

  /**
   * GET /api/auth/me
   * Retorna informações do usuário autenticado
   */
  static getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado',
      });
    }

    const user = await AuthService.getUserByUid(uid);

    return res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * DELETE /api/auth/delete
   * Deleta o usuário autenticado
   */
  static deleteAccount = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Não autorizado',
        });
      }

      await AuthService.deleteUser(uid);

      return res.status(200).json({
        success: true,
        message: 'Conta deletada com sucesso',
      });
    }
  );

  /**
   * POST /api/auth/resend-verification
   * Reenvia o email de verificação
   */
  static resendVerificationEmail = asyncHandler(
    async (req: Request, res: Response) => {
      const { email } = req.body;

      const verificationLink = await AuthService.resendVerificationEmail(email);

      return res.status(200).json({
        success: true,
        message: 'Email de verificação enviado com sucesso',
        // Apenas para desenvolvimento - remover em produção
        data: {
          verificationLink,
        },
      });
    }
  );

  /**
   * GET /api/auth/verify-status
   * Verifica o status de verificação do email do usuário autenticado
   */
  static checkVerificationStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Não autorizado',
        });
      }

      const isVerified = await AuthService.checkEmailVerification(uid);

      return res.status(200).json({
        success: true,
        data: {
          emailVerified: isVerified,
        },
      });
    }
  );
}
