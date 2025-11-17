import { Response } from 'express';
import { StudentService } from '../services/studentService';
import { asyncHandler } from '../middlewares/asyncHandler';
import { AuthRequest } from '../types';

export class StudentController {
  /**
   * PUT /api/student/profile
   * Cria ou atualiza o perfil completo do aluno
   */
  static createOrUpdateProfile = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Não autorizado',
        });
      }

      const profileData = req.body;

      const profile = await StudentService.createOrUpdateProfile(
        uid,
        profileData
      );

      return res.status(200).json({
        success: true,
        data: profile,
        message: 'Perfil salvo com sucesso',
      });
    }
  );

  /**
   * GET /api/student/profile
   * Retorna o perfil do aluno autenticado
   */
  static getProfile = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Não autorizado',
        });
      }

      const profile = await StudentService.getProfile(uid);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        data: profile,
      });
    }
  );
}
