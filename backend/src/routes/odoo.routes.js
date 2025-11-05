import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  saveCredentials,
  getCredentials,
  testConnection,
  deleteCredentials,
  getOdooFields,
} from '../controllers/odoo.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Guardar credenciales
router.post(
  '/credentials',
  [
    body('url').trim().notEmpty().withMessage('La URL de Odoo es requerida'),
    body('database').trim().notEmpty().withMessage('La base de datos es requerida'),
    body('username').trim().notEmpty().withMessage('El usuario es requerido'),
    body('password').trim().notEmpty().withMessage('La contraseña es requerida'),
  ],
  validate,
  saveCredentials
);

// Obtener credenciales
router.get('/credentials', getCredentials);

// Probar conexión
router.post('/test-connection', testConnection);

// Eliminar credenciales
router.delete('/credentials', deleteCredentials);

// Obtener campos de Odoo (DEBUG)
router.get('/fields', getOdooFields);

export default router;

