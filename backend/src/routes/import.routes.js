import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import upload, { handleMulterError } from '../middleware/upload.middleware.js';
import {
  uploadFile,
  executeImport,
  getHistory,
  getImportDetails,
  getStats,
  extractDeadlines,
} from '../controllers/import.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Subir archivo
router.post('/upload', upload.single('file'), handleMulterError, uploadFile);

// Ejecutar importación
router.post(
  '/execute',
  [
    body('filePath').trim().notEmpty().withMessage('La ruta del archivo es requerida'),
    body('fileName').trim().notEmpty().withMessage('El nombre del archivo es requerido'),
    body('fileType').trim().notEmpty().withMessage('El tipo de archivo es requerido'),
  ],
  validate,
  executeImport
);

// Obtener historial
router.get('/history', getHistory);

// Obtener estadísticas
router.get('/stats', getStats);

// Obtener detalles de importación
router.get('/history/:id', getImportDetails);

// Extraer fechas de cierre desde enlaces
router.post(
  '/extract-deadlines',
  [
    body('filePath').trim().notEmpty().withMessage('La ruta del archivo es requerida'),
  ],
  validate,
  extractDeadlines
);

export default router;


