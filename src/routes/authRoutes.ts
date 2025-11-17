import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validator';

const router = Router();

// Validações
const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('name').optional().isString().withMessage('Nome deve ser uma string'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

// Rotas públicas
router.post(
  '/register',
  validate(registerValidation),
  AuthController.register
);

router.post('/login', validate(loginValidation), AuthController.login);

// Rotas protegidas (requerem autenticação)
router.get('/me', authenticate, AuthController.getMe);
router.delete('/delete', authenticate, AuthController.deleteAccount);

export default router;
