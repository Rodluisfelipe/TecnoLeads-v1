import api from './api';

const odooService = {
  // Guardar credenciales
  saveCredentials: async (credentials) => {
    const response = await api.post('/odoo/credentials', credentials);
    return response.data;
  },

  // Obtener credenciales
  getCredentials: async () => {
    const response = await api.get('/odoo/credentials');
    return response.data;
  },

  // Probar conexión
  testConnection: async () => {
    const response = await api.post('/odoo/test-connection');
    return response.data;
  },

  // Eliminar credenciales
  deleteCredentials: async () => {
    const response = await api.delete('/odoo/credentials');
    return response.data;
  },
};

export default odooService;


