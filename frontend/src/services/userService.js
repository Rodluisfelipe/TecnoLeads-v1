import api from './api';

const userService = {
  // Actualizar perfil
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  },

  // Eliminar cuenta
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },
};

export default userService;


