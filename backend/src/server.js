import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import odooRoutes from './routes/odoo.routes.js';
import importRoutes from './routes/import.routes.js';
import userRoutes from './routes/user.routes.js';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting (desactivado en desarrollo para testing)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.',
  });
  app.use('/api/', limiter);
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/odoo', odooRoutes);
app.use('/api/import', importRoutes);
app.use('/api/users', userRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TecnoLeads API está funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Debug endpoint - ELIMINAR EN PRODUCCIÓN
app.get('/api/debug/config', (req, res) => {
  res.json({
    jwtSecretLength: process.env.JWT_SECRET?.length,
    jwtSecretPreview: process.env.JWT_SECRET?.substring(0, 10) + '...',
    mongoConnected: mongoose.connection.readyState === 1,
    nodeEnv: process.env.NODE_ENV,
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📝 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  });

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  console.log('\n⏹️  Cerrando servidor...');
  await mongoose.connection.close();
  process.exit(0);
});

export default app;

