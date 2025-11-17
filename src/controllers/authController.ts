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
    const { email, password, name } = req.body;

    const result = await AuthService.register({ email, password, name });

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

    res.status(200).json({
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

      res.status(200).json({
        success: true,
        message: 'Conta deletada com sucesso',
      });
    }
  );
}
