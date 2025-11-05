import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/user.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Actualizar perfil
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  ],
  validate,
  updateProfile
);

// Cambiar contraseña
router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  changePassword
);

// Eliminar cuenta
router.delete('/account', deleteAccount);

export default router;


