import { Router } from 'express';
import { UniversityController } from '../controllers/universityController';

const router = Router();

/**
 * GET /api/universities
 * Lista todas as universidades (rota pública)
 */
router.get('/', UniversityController.listUniversities);

/**
 * GET /api/universities/:id
 * Busca uma universidade por ID (rota pública)
 */
router.get('/:id', UniversityController.getUniversityById);

/**
 * POST /api/universities/seed
 * Cria seed inicial de universidades (apenas para desenvolvimento)
 */
router.post('/seed', UniversityController.seedUniversities);

export default router;
