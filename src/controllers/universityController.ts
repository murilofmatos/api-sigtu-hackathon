import { Request, Response } from 'express';
import { UniversityService } from '../services/universityService';
import { asyncHandler } from '../middlewares/asyncHandler';

export class UniversityController {
  /**
   * GET /api/universities
   * Lista todas as universidades ativas
   */
  static listUniversities = asyncHandler(
    async (req: Request, res: Response) => {
      const universities = await UniversityService.listUniversities();

      return res.status(200).json({
        success: true,
        data: universities,
      });
    }
  );

  /**
   * GET /api/universities/:id
   * Busca uma universidade por ID
   */
  static getUniversityById = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;

      const university = await UniversityService.getUniversityById(id);

      if (!university) {
        return res.status(404).json({
          success: false,
          message: 'Universidade não encontrada',
        });
      }

      return res.status(200).json({
        success: true,
        data: university,
      });
    }
  );

  /**
   * POST /api/universities/seed
   * Cria seed inicial de universidades (apenas para desenvolvimento)
   */
  static seedUniversities = asyncHandler(
    async (req: Request, res: Response) => {
      await UniversityService.seedUniversities();

      return res.status(201).json({
        success: true,
        message: 'Universidades criadas com sucesso',
      });
    }
  );
}
