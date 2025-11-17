import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { validate } from '../middlewares/validator';
import { studentProfileValidation } from '../utils/validators';

const router = Router();

// Todas as rotas de aluno requerem autenticação e role 'student'
router.use(authenticate);
router.use(requireRole(['student']));

/**
 * PUT /api/student/profile
 * Cria ou atualiza o perfil completo do aluno
 */
router.put(
  '/profile',
  validate(studentProfileValidation),
  StudentController.createOrUpdateProfile
);

/**
 * GET /api/student/profile
 * Retorna o perfil do aluno autenticado
 */
router.get('/profile', StudentController.getProfile);

export default router;
