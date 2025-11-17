import { Router } from 'express';
import authRoutes from './authRoutes';
import studentRoutes from './studentRoutes';
import universityRoutes from './universityRoutes';

const router = Router();

// Rota de health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de aluno
router.use('/student', studentRoutes);

// Rotas de universidades
router.use('/universities', universityRoutes);

export default router;
