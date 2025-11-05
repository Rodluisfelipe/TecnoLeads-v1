import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no proporcionado',
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Usuario desactivado',
        });
      }

      next();
    } catch (error) {
      // Debug: mostrar el error específico
      console.log('🔴 Token verification error:', error.name, error.message);
      console.log('🔑 JWT_SECRET configurado:', process.env.JWT_SECRET ? 'SÍ (' + process.env.JWT_SECRET.length + ' chars)' : 'NO');
      console.log('🎫 Token recibido (primeros 50 chars):', token.substring(0, 50) + '...');
      
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la autenticación',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
    }
    next();
  };
};

