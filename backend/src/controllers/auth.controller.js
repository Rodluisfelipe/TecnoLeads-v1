import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.model.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.util.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Registro de usuario
export const register = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      company,
    });

    // Generar tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Guardar refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario (incluir password)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Cuenta creada con Google: no tiene contraseña local
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Esta cuenta usa inicio de sesión con Google. Usa el botón "Continuar con Google".',
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar si está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado',
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Guardar refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

// Login / Registro con Google
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Token de Google no proporcionado',
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Inicio de sesión con Google no configurado en el servidor',
      });
    }

    // Verificar el ID token directamente con Google (valida firma, audiencia y expiración)
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      return res.status(401).json({
        success: false,
        message: 'Token de Google inválido o expirado',
      });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(401).json({
        success: false,
        message: 'El email de Google no está verificado',
      });
    }

    // Buscar usuario existente por googleId o por email (para vincular cuentas locales previas)
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Vincular cuenta local existente con Google si aún no lo estaba
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.avatar) user.avatar = picture;
      }
    } else {
      // Crear usuario nuevo (sin password, se autentica solo por Google)
      user = new User({
        name: name || email.split('@')[0],
        email,
        googleId,
        authProvider: 'google',
        avatar: picture,
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado',
      });
    }

    user.lastLogin = new Date();

    // Generar tokens
    const accessToken = generateAccessToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);
    user.refreshToken = refreshTokenValue;

    await user.save();

    res.json({
      success: true,
      message: 'Login con Google exitoso',
      data: {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken: refreshTokenValue,
      },
    });
  } catch (error) {
    console.error('Error en login con Google:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión con Google',
      error: error.message,
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token no proporcionado',
      });
    }

    // Verificar token
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      return res.status(400).json({
        success: false,
        message: 'Token inválido',
      });
    }

    // Buscar usuario
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido',
      });
    }

    // Generar nuevos tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Actualizar refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(401).json({
      success: false,
      message: 'Error al refrescar token',
      error: error.message,
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = null;
    await user.save();

    res.json({
      success: true,
      message: 'Logout exitoso',
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error.message,
    });
  }
};

// Obtener perfil del usuario actual
export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message,
    });
  }
};


