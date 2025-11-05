import jwt from 'jsonwebtoken';

// IMPORTANTE: NO cachear JWT_SECRET en una constante
// Usar siempre process.env.JWT_SECRET directamente para evitar problemas
// si el .env se carga después de que este módulo se importe

export const generateAccessToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }
  
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export const generateRefreshToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }
  
  return jwt.sign({ id: userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
};

export const verifyToken = (token) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

