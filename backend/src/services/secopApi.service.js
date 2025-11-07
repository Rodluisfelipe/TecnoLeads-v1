// Servicio para obtener detalles de contratos desde la API de SECOP II
// Sin necesidad de Puppeteer/Chrome - Mucho más rápido y confiable

import axios from 'axios';

class SecopApiService {
  constructor() {
    this.baseUrl = 'https://mcol.licitaciones.info';
    this.headers = {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json;charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
      'Origin': 'https://mcol.licitaciones.info',
      'Referer': 'https://mcol.licitaciones.info/'
    };
  }

  /**
   * Corregir desfase de zona horaria Colombia (UTC-5)
   * Las fechas del SECOP vienen en hora local de Colombia pero Odoo las interpreta como UTC
   * Por eso necesitamos SUMAR 5 horas para compensar
   * @param {string} fechaStr - Fecha en formato YYYY-MM-DD HH:MM:SS
   * @returns {string} Fecha corregida
   */
  corregirDesfaseHorario(fechaStr) {
    if (!fechaStr) return null;
    
    try {
      // Parsear la fecha como si fuera local (sin el Z)
      const fecha = new Date(fechaStr.replace(' ', 'T'));
      
      // SUMAR 5 horas para que cuando Odoo las interprete como UTC, queden correctas
      // Ejemplo: 09:00 + 5h = 14:00 → Odoo (UTC-5) lo lee como 09:00 ✅
      fecha.setHours(fecha.getHours() + 5);
      
      // Formatear de vuelta a YYYY-MM-DD HH:MM:SS
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const hours = String(fecha.getHours()).padStart(2, '0');
      const minutes = String(fecha.getMinutes()).padStart(2, '0');
      const seconds = String(fecha.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error(`❌ Error corrigiendo desfase horario:`, error.message);
      return fechaStr; // Retornar original si hay error
    }
  }

  /**
   * Obtener detalles completos de un contrato desde la API
   * @param {string} codigoContrato - Código del contrato (ej: "FDLBU-SASI-008-2025")
   * @returns {Object} Datos completos del contrato
   */
  async obtenerDetalleContrato(codigoContrato) {
    try {
      console.log(`📡 Consultando API para contrato: ${codigoContrato}`);

      const response = await axios.post(
        `${this.baseUrl}/obtener-detalle-contrato`,
        {
          codigo_proceso: codigoContrato
        },
        {
          headers: this.headers,
          timeout: 30000 // 30 segundos timeout
        }
      );

      if (response.data && response.data.status === 1) {
        console.log(`✅ Datos obtenidos exitosamente para ${codigoContrato}`);
        return this.procesarRespuesta(response.data);
      } else {
        console.log(`⚠️ No se encontraron datos para ${codigoContrato}`);
        return null;
      }

    } catch (error) {
      console.error(`❌ Error al consultar API para ${codigoContrato}:`, error.message);
      
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      }
      
      // No lanzar error, devolver null para que continúe el proceso
      return null;
    }
  }

  /**
   * Obtener detalles desde una URL (extrae el código automáticamente)
   * @param {string} url - URL del contrato
   * @returns {Object} Datos completos del contrato
   */
  async obtenerDetalleContratoDesdeUrl(url) {
    try {
      // Intentar extraer código de proceso de la URL
      const codigoMatch = url.match(/codigo_proceso=([^&]+)/);
      if (codigoMatch && codigoMatch[1]) {
        const codigo = decodeURIComponent(codigoMatch[1]);
        return await this.obtenerDetalleContrato(codigo);
      }
      
      // Si tiene parámetro random, extraer datos del HTML
      const randomMatch = url.match(/random=([^&]+)/);
      if (randomMatch && randomMatch[1]) {
        console.log(`🔍 URL con parámetro random, extrayendo datos del HTML...`);
        
        try {
          // Hacer petición GET a la URL para obtener el HTML
          const htmlResponse = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 15000,
            maxRedirects: 5
          });
          
          const html = htmlResponse.data;
          
          // Extraer el JSON completo del atributo contrato del componente Vue
          const contratoMatch = html.match(/contrato="({&quot;[^"]+})"/);
          if (contratoMatch) {
            // Decodificar HTML entities
            const jsonStr = contratoMatch[1]
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&');
            
            const contratoData = JSON.parse(jsonStr);
            console.log(`✅ Datos extraídos del HTML para: ${contratoData.CodigoProceso}`);
            
            // Corregir desfase horario: SUMAR 5 horas
            const fechaVencimientoCorregida = this.corregirDesfaseHorario(contratoData.FechaVencimiento);
            const fechaPublicacionCorregida = this.corregirDesfaseHorario(contratoData.FechaPublicacion);
            
            console.log(`📅 Fecha original: ${contratoData.FechaVencimiento} → Corregida: ${fechaVencimientoCorregida}`);
            
            // Retornar en formato compatible con procesarRespuesta
            return {
              general: {
                codigo_proceso: contratoData.CodigoProceso,
                nombre: contratoData.Nombre || contratoData.Objeto,
                entidad: contratoData.EntidadContratante,
                valor: contratoData.Valor,
                estado: contratoData.estado_agrupado,
                fecha_publicacion: fechaPublicacionCorregida,
                fecha_vencimiento: fechaVencimientoCorregida
              },
              cronograma: fechaVencimientoCorregida ? [{
                evento: 'Presentación de Ofertas',
                fecha: fechaVencimientoCorregida
              }] : [],
              // DATOS COMPLETOS para visualización detallada
              datosCompletos: {
                ...contratoData,
                FechaVencimiento: fechaVencimientoCorregida,
                FechaPublicacion: fechaPublicacionCorregida,
                FechaVencimientoOriginal: contratoData.FechaVencimiento
              }
            };
          }
          
          console.warn(`⚠️ No se encontró el JSON embebido en el HTML`);
          return null;
          
        } catch (htmlError) {
          console.error(`❌ Error obteniendo HTML de la URL:`, htmlError.message);
          return null;
        }
      }
      
      // Si no hay codigo_proceso ni random, no podemos hacer nada
      console.warn(`⚠️ No se pudo extraer codigo_proceso de la URL: ${url}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error obteniendo detalles desde URL:`, error.message);
      return null;
    }
  }

  /**
   * Procesar la respuesta de la API y extraer fechas importantes
   * @param {Object} data - Respuesta de la API
   * @returns {Object} Datos procesados
   */
  procesarRespuesta(data) {
    const resultado = {
      status: 'success',
      detalles: data.detalle || [],
      general: data.general || {},
      contratante: data.contratante || {},
      fechas: this.extraerFechas(data.detalle),
      configuracionFinanciera: this.extraerConfiguracionFinanciera(data.detalle),
      planAdquisiciones: this.extraerPlanAdquisiciones(data.detalle),
      observaciones: this.extraerObservaciones(data.detalle)
    };

    return resultado;
  }

  /**
   * Extraer todas las fechas del cronograma
   * @param {Array} detalles - Array de detalles del contrato
   * @returns {Array} Fechas importantes del proceso
   */
  extraerFechas(detalles) {
    const cronogramaSection = detalles.find(d => d.nombre === 'Cronograma');
    
    if (!cronogramaSection || !cronogramaSection.childrens) {
      return [];
    }

    const fechas = [];
    
    cronogramaSection.childrens.forEach(child => {
      if (child.tipo_dato === 'list_sin_divisor' && Array.isArray(child.valor)) {
        child.valor.forEach(grupo => {
          if (Array.isArray(grupo)) {
            grupo.forEach(item => {
              if (item.header && item.valor) {
                fechas.push({
                  evento: item.header,
                  fecha: item.valor,
                  id: item.id
                });
              }
            });
          }
        });
      }
    });

    return fechas;
  }

  /**
   * Extraer configuración financiera y garantías
   * @param {Array} detalles - Array de detalles del contrato
   * @returns {Object} Configuración financiera
   */
  extraerConfiguracionFinanciera(detalles) {
    const financieraSection = detalles.find(d => d.nombre === 'Configuración financiera');
    
    if (!financieraSection || !financieraSection.childrens) {
      return {};
    }

    const config = {};
    
    financieraSection.childrens.forEach(child => {
      if (child.nombre && child.valor) {
        const key = child.nombre.toLowerCase().replace(/[¿?]/g, '').trim();
        config[key] = child.valor;
      }
    });

    return config;
  }

  /**
   * Extraer información del plan anual de adquisiciones
   * @param {Array} detalles - Array de detalles del contrato
   * @returns {Object} Información del PAA
   */
  extraerPlanAdquisiciones(detalles) {
    const paaSection = detalles.find(d => d.nombre === 'Plan anual de adquisiciones');
    
    if (!paaSection || !paaSection.childrens) {
      return {};
    }

    const paa = {};
    
    paaSection.childrens.forEach(child => {
      if (child.nombre && child.valor) {
        const key = child.nombre.toLowerCase().replace(/[¿?]/g, '').trim();
        paa[key] = child.valor;
      }
    });

    return paa;
  }

  /**
   * Extraer observaciones y mensajes públicos
   * @param {Array} detalles - Array de detalles del contrato
   * @returns {Array} Mensajes y observaciones
   */
  extraerObservaciones(detalles) {
    const obsSection = detalles.find(d => d.nombre === 'Observaciones y mensajes');
    
    if (!obsSection || !obsSection.childrens) {
      return [];
    }

    const observaciones = [];
    
    obsSection.childrens.forEach(child => {
      if (child.tipo_dato === 'table' && Array.isArray(child.valor)) {
        child.valor.forEach(tabla => {
          if (tabla.campos && Array.isArray(tabla.campos)) {
            tabla.campos.forEach((fila, index) => {
              observaciones.push({
                tipo: fila[0] || '',
                referencia: fila[1] || '',
                asunto: fila[2] || '',
                fecha: fila[3] || '',
                detalle: fila[5] || ''
              });
            });
          }
        });
      }
    });

    return observaciones;
  }

  /**
   * Obtener fecha específica del cronograma
   * @param {string} codigoContrato - Código del contrato
   * @param {string} tipoFecha - Tipo de fecha a buscar (ej: "Publicación del aviso")
   * @returns {string|null} Fecha encontrada o null
   */
  async obtenerFechaEspecifica(codigoContrato, tipoFecha) {
    try {
      const detalles = await this.obtenerDetalleContrato(codigoContrato);
      
      if (!detalles || !detalles.fechas) {
        return null;
      }

      const fechaEncontrada = detalles.fechas.find(f => 
        f.evento.toLowerCase().includes(tipoFecha.toLowerCase())
      );

      return fechaEncontrada ? fechaEncontrada.fecha : null;

    } catch (error) {
      console.error(`Error al obtener fecha específica:`, error.message);
      return null;
    }
  }

  /**
   * Validar que un contrato existe en el sistema
   * @param {string} codigoContrato - Código del contrato
   * @returns {boolean} true si existe, false si no
   */
  async validarContratoExiste(codigoContrato) {
    try {
      const detalles = await this.obtenerDetalleContrato(codigoContrato);
      return detalles !== null && detalles.status === 'success';
    } catch (error) {
      return false;
    }
  }
}

export default new SecopApiService();
