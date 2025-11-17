import { Router } from 'express';
import authRoutes from './authRoutes';

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

export default router;
