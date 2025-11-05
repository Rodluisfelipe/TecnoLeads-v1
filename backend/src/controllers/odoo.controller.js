import OdooCredentials from '../models/OdooCredentials.model.js';
import { encrypt, decrypt } from '../utils/encryption.util.js';
import OdooService from '../services/odoo.service.js';

// Guardar/Actualizar credenciales de Odoo
export const saveCredentials = async (req, res) => {
  try {
    const { url, database, username, password } = req.body;
    const userId = req.user._id;

    // Cifrar contraseña
    const encryptedPassword = encrypt(password);

    // Buscar credenciales existentes
    let credentials = await OdooCredentials.findOne({ userId });

    if (credentials) {
      // Actualizar
      credentials.url = url;
      credentials.database = database;
      credentials.username = username;
      credentials.encryptedPassword = encryptedPassword;
      credentials.lastTestResult = 'pending';
      await credentials.save();
    } else {
      // Crear nuevas
      credentials = await OdooCredentials.create({
        userId,
        url,
        database,
        username,
        encryptedPassword,
      });
    }

    res.json({
      success: true,
      message: 'Credenciales guardadas exitosamente',
      data: {
        id: credentials._id,
        url: credentials.url,
        database: credentials.database,
        username: credentials.username,
        isActive: credentials.isActive,
        lastTested: credentials.lastTested,
        lastTestResult: credentials.lastTestResult,
      },
    });
  } catch (error) {
    console.error('Error guardando credenciales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar credenciales',
      error: error.message,
    });
  }
};

// Obtener credenciales
export const getCredentials = async (req, res) => {
  try {
    const userId = req.user._id;

    const credentials = await OdooCredentials.findOne({ userId });

    if (!credentials) {
      return res.status(404).json({
        success: false,
        message: 'No hay credenciales configuradas',
      });
    }

    res.json({
      success: true,
      data: {
        id: credentials._id,
        url: credentials.url,
        database: credentials.database,
        username: credentials.username,
        isActive: credentials.isActive,
        lastTested: credentials.lastTested,
        lastTestResult: credentials.lastTestResult,
        lastTestMessage: credentials.lastTestMessage,
      },
    });
  } catch (error) {
    console.error('Error obteniendo credenciales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener credenciales',
      error: error.message,
    });
  }
};

// Probar conexión con Odoo
export const testConnection = async (req, res) => {
  try {
    const userId = req.user._id;

    const credentials = await OdooCredentials.findOne({ userId });

    if (!credentials) {
      return res.status(404).json({
        success: false,
        message: 'No hay credenciales configuradas',
      });
    }

    // Crear servicio de Odoo
    const odooService = new OdooService(credentials);

    // Probar conexión
    const result = await odooService.testConnection();

    // Actualizar resultado de prueba
    credentials.lastTested = new Date();
    credentials.lastTestResult = result.success ? 'success' : 'failed';
    credentials.lastTestMessage = result.message;
    await credentials.save();

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          userId: result.userId,
          hasAccess: result.hasAccess,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Error probando conexión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al probar conexión',
      error: error.message,
    });
  }
};

// Eliminar credenciales
export const deleteCredentials = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await OdooCredentials.deleteOne({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay credenciales para eliminar',
      });
    }

    res.json({
      success: true,
      message: 'Credenciales eliminadas exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando credenciales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar credenciales',
      error: error.message,
    });
  }
};

// Obtener campos del modelo crm.lead (DEBUG)
export const getOdooFields = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const credentials = await OdooCredentials.findOne({ userId });
    
    if (!credentials) {
      return res.status(404).json({
        success: false,
        message: 'No hay credenciales configuradas',
      });
    }

    const odooService = new OdooService(credentials);
    const fields = await odooService.getModelFields('crm.lead');
    
    // Filtrar solo campos personalizados y campos relevantes
    const customFields = {};
    const presentacionFields = {};
    
    for (const [fieldName, fieldData] of Object.entries(fields)) {
      // Campos que contengan "present" o "portal"
      if (fieldName.toLowerCase().includes('present') || 
          fieldName.toLowerCase().includes('portal')) {
        presentacionFields[fieldName] = {
          string: fieldData.string,
          type: fieldData.type,
        };
      }
      // Todos los campos personalizados (x_)
      if (fieldName.startsWith('x_')) {
        customFields[fieldName] = {
          string: fieldData.string,
          type: fieldData.type,
        };
      }
    }

    res.json({
      success: true,
      message: 'Campos obtenidos exitosamente',
      data: {
        presentacionFields,
        totalCustomFields: Object.keys(customFields).length,
        customFields: Object.keys(customFields).slice(0, 20), // Primeros 20
      },
    });
  } catch (error) {
    console.error('Error obteniendo campos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener campos de Odoo',
      error: error.message,
    });
  }
};

