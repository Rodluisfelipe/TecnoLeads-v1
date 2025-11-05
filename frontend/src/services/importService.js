import api from './api';

const importService = {
  // Subir archivo
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/import/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    
    return response.data;
  },

  // Ejecutar importación
  executeImport: async (importData) => {
    console.log('📤 Enviando importación a Odoo:', importData);
    const response = await api.post('/import/execute', importData);
    console.log('📥 Respuesta completa de Odoo:', response);
    console.log('📊 Datos de respuesta:', response.data);
    console.log('✅ Success:', response.data.success);
    console.log('📈 Total records:', response.data.data?.totalRecords);
    console.log('✔️ Successful:', response.data.data?.successful);
    console.log('❌ Failed:', response.data.data?.failed);
    console.log('🔄 Duplicates:', response.data.data?.duplicates);
    
    // 🔍 MOSTRAR ERRORES DETALLADOS SI EXISTEN
    if (response.data.data?.failed > 0) {
      console.error('⚠️⚠️⚠️ ERRORES DETALLADOS DE IMPORTACIÓN ⚠️⚠️⚠️');
      // Intentar obtener detalles del historial
      if (response.data.data?.importId) {
        try {
          const details = await api.get(`/import/history/${response.data.data.importId}`);
          console.error('📋 Errores completos:', details.data.data?.importErrors);
          details.data.data?.importErrors?.forEach((err, idx) => {
            console.error(`\n❌ Error ${idx + 1}:`);
            console.error(`   Fila: ${err.row}`);
            console.error(`   Mensaje: ${err.message}`);
            console.error(`   Timestamp: ${err.timestamp}`);
          });
        } catch (e) {
          console.error('No se pudieron obtener detalles de errores');
        }
      }
    }
    
    return response.data;
  },

  // Obtener historial
  getHistory: async (params = {}) => {
    const response = await api.get('/import/history', { params });
    return response.data;
  },

  // Obtener detalles de importación
  getImportDetails: async (id) => {
    const response = await api.get(`/import/history/${id}`);
    return response.data;
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await api.get('/import/stats');
    return response.data;
  },

  // 📅 Extraer fechas de cierre desde enlaces
  extractDeadlines: async (filePath) => {
    console.log('🔗 Solicitando extracción de fechas para:', filePath);
    const response = await api.post('/import/extract-deadlines', { filePath });
    console.log('📅 Fechas extraídas:', response.data);
    return response.data;
  },
};

export default importService;


