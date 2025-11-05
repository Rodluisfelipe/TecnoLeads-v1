import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
} from '../controllers/auth.controller.js';

const router = express.Router();

// Registro
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  validate,
  login
);

// Refresh token
router.post('/refresh', refreshToken);

// Logout (protegido)
router.post('/logout', protect, logout);

// Obtener perfil (protegido)
router.get('/profile', protect, getProfile);

export default router;


