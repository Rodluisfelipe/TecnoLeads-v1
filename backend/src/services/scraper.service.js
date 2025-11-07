// Servicio de scraping SIMPLIFICADO - Solo usa API de SECOP II
// NO requiere Puppeteer ni Chrome

import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { parse, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import secopApiService from './secopApi.service.js';

class ScraperService {
  constructor() {
    this.timezone = 'America/Bogota';
    
    // Mapeo de meses en español
    this.monthMap = {
      'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'ago': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
    };
  }

  // 🔍 Validar URL
  validateUrl(url) {
    if (!url || typeof url !== 'string') {
      return { valid: false, reason: 'URL vacía o inválida' };
    }

    try {
      const urlObj = new URL(url);
      
      if (!urlObj.protocol.startsWith('http')) {
        return { valid: false, reason: 'Protocolo no HTTP/HTTPS' };
      }

      if (!urlObj.hostname.includes('licitaciones.info')) {
        return { valid: false, reason: 'No es un dominio de licitaciones.info' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Formato de URL inválido' };
    }
  }

  // 📅 Extraer fecha de presentación de ofertas usando la API
  async extractDeadlineDate(url, retries = 1, numeroContrato = null) {
    const validation = this.validateUrl(url);
    if (!validation.valid) {
      return {
        enlace: url,
        raw: null,
        normalized: null,
        status: 'invalid_url',
        meta: { reason: validation.reason }
      };
    }

    try {
      console.log(`🌐 Obteniendo fecha desde API para: ${url}`);
      
      // ESTRATEGIA: Si la URL tiene parámetro random, extraer DIRECTAMENTE del HTML
      // Esto funciona mejor que la API de licitaciones.info que requiere autenticación
      const randomMatch = url.match(/random=([^&]+)/);
      if (randomMatch && randomMatch[1]) {
        console.log(`📋 URL con parámetro random, extrayendo datos del HTML...`);
        
        // Hacer una petición directa para obtener los datos desde el HTML
        const detalles = await secopApiService.obtenerDetalleContratoDesdeUrl(url);
        if (detalles && detalles.general && detalles.general.fecha_vencimiento) {
          const fechaVencimiento = detalles.general.fecha_vencimiento;
          const codigoProceso = detalles.general.codigo_proceso || numeroContrato;
          const enlaceSecop = detalles.general.enlace_secop || null;  // 🔗 Enlace oficial extraído
          
          console.log(`✅ Código extraído del HTML: ${codigoProceso}`);
          console.log(`✅ Fecha extraída del HTML: ${fechaVencimiento}`);
          if (enlaceSecop) {
            console.log(`✅ Enlace SECOP extraído: ${enlaceSecop}`);
          }
          
          // La fecha ya viene normalizada en formato YYYY-MM-DD HH:MM:SS
          return {
            enlace: url,
            raw: fechaVencimiento,
            normalized: fechaVencimiento,
            status: 'success',
            meta: { 
              source: 'html_extraction',
              codigo_proceso: codigoProceso,
              enlace_secop: enlaceSecop
            },
            // INCLUIR DATOS COMPLETOS para visualización
            datosCompletos: detalles.datosCompletos || null
          };
        } else {
          console.log(`⚠️ No se pudo extraer la fecha del HTML`);
          return {
            enlace: url,
            raw: null,
            normalized: null,
            status: 'not_found',
            meta: { reason: 'No se encontró la fecha en el HTML de licitaciones.info' }
          };
        }
      }
      
      // Si no tiene random, seguir con el flujo normal (codigo_proceso en URL o CSV)
      let codigoProceso = null;
      
      // PRIORIDAD 1: Usar el número de contrato del CSV si está disponible
      if (numeroContrato && typeof numeroContrato === 'string' && numeroContrato.trim()) {
        codigoProceso = numeroContrato.trim();
        console.log(`✅ Usando código de proceso del CSV (columna Número): ${codigoProceso}`);
      }
      
      // PRIORIDAD 2: codigo_proceso en query params de la URL
      if (!codigoProceso) {
        let codigoMatch = url.match(/codigo_proceso=([^&]+)/);
        if (codigoMatch && codigoMatch[1]) {
          codigoProceso = decodeURIComponent(codigoMatch[1]);
          console.log(`✅ Código de proceso extraído de URL: ${codigoProceso}`);
        }
      }
      
      if (!codigoProceso) {
        console.log(`⚠️ No se pudo extraer código de proceso de la URL`);
        console.log(`💡 SUGERENCIA: Use URLs con el parámetro 'codigo_proceso' en lugar de 'random'`);
        console.log(`   Ejemplo: https://col.licitaciones.info/detalle-contrato?codigo_proceso=CODIGO-AQUI`);
        return {
          enlace: url,
          raw: null,
          normalized: null,
          status: 'invalid_url',
          meta: { 
            reason: 'URL con parámetro random - no se puede extraer codigo_proceso sin login',
            suggestion: 'Use URLs con parámetro codigo_proceso o exporte desde SECOP II con el formato correcto'
          }
        };
      }

      console.log(`📋 Código de proceso: ${codigoProceso}`);
      
      // Obtener fecha desde la API
      const fechaApi = await secopApiService.obtenerFechaEspecifica(
        codigoProceso,
        'Presentación de Ofertas'
      );
      
      if (!fechaApi) {
        console.log(`⚠️ No se encontró "Presentación de Ofertas" en la API`);
        return {
          enlace: url,
          raw: null,
          normalized: null,
          status: 'not_found',
          meta: { reason: 'No se encontró la fecha de presentación de ofertas' }
        };
      }

      console.log(`✅ Fecha obtenida desde API: ${fechaApi}`);
      
      // Normalizar fecha
      const normalized = this.normalizeDateString(fechaApi);
      
      if (!normalized) {
        console.log(`⚠️ Error al normalizar la fecha: ${fechaApi}`);
        return {
          enlace: url,
          raw: fechaApi,
          normalized: null,
          status: 'parse_error',
          meta: { reason: 'Error al parsear la fecha obtenida' }
        };
      }

      return {
        enlace: url,
        raw: fechaApi,
        normalized: normalized,
        status: 'success',
        meta: { 
          source: 'api',
          message: 'Fecha obtenida desde API de SECOP II'
        }
      };

    } catch (error) {
      console.error(`❌ Error obteniendo fecha:`, error.message);
      return {
        enlace: url,
        raw: null,
        normalized: null,
        status: 'error',
        meta: { reason: error.message }
      };
    }
  }

  // 📅 Normalizar fecha desde formato API a ISO 8601
  normalizeDateString(rawDate) {
    try {
      // Formato esperado: "20/Nov/2025 - 09:00 am"
      const regex = /(\d{1,2})\/([a-zA-Z]{3})\/(\d{4})\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm)/i;
      const match = rawDate.match(regex);

      if (!match) {
        console.warn(`Formato de fecha no reconocido: ${rawDate}`);
        return null;
      }

      const [, day, monthStr, year, hour, minute, ampm] = match;

      // Convertir mes a número
      const monthLower = monthStr.toLowerCase();
      const month = this.monthMap[monthLower];

      if (!month) {
        console.warn(`Mes desconocido: ${monthStr}`);
        return null;
      }

      // Convertir hora 12h a 24h
      let hour24 = parseInt(hour, 10);
      if (ampm.toLowerCase() === 'pm' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm.toLowerCase() === 'am' && hour24 === 12) {
        hour24 = 0;
      }

      // Construir fecha ISO
      const dayPadded = day.padStart(2, '0');
      const hourPadded = hour24.toString().padStart(2, '0');
      const minutePadded = minute.padStart(2, '0');

      // Formato: YYYY-MM-DD HH:MM:SS (hora local de Bogotá)
      const isoDate = `${year}-${month}-${dayPadded} ${hourPadded}:${minutePadded}:00`;
      
      console.log(`📅 Fecha normalizada: ${rawDate} → ${isoDate}`);
      return isoDate;

    } catch (error) {
      console.error(`Error normalizando fecha:`, error.message);
      return null;
    }
  }

  // 📊 Extraer fechas de múltiples registros en lotes
  async extractDeadlineDatesFromRows(rows, batchSize = 5) {
    console.log(`📊 Extrayendo fechas de cierre de ${rows.length} registros...`);
    console.log(`⚙️  Procesando en lotes de ${batchSize} URLs concurrentes`);

    const results = [];
    const totalBatches = Math.ceil(rows.length / batchSize);

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`\n📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} URLs)...`);

      const batchPromises = batch.map(row => {
        const url = row.enlace || row.Enlace || row.url;
        const numeroContrato = row.numero || row.Numero || row['Número'] || null;
        
        if (!url) {
          return Promise.resolve({
            enlace: null,
            raw: null,
            normalized: null,
            status: 'missing_url',
            meta: { reason: 'Fila sin URL' }
          });
        }
        
        // Pasar el número de contrato si está disponible
        return this.extractDeadlineDate(url, 3, numeroContrato);
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      const successCount = batchResults.filter(r => r.status === 'success').length;
      console.log(`✅ Lote completado: ${successCount}/${batch.length} exitosos`);

      // Pequeña pausa entre lotes para no sobrecargar la API
      if (i + batchSize < rows.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Resumen final
    const summary = {
      total: results.length,
      ok: results.filter(r => r.status === 'success').length,
      not_found: results.filter(r => r.status === 'not_found').length,
      invalid_url: results.filter(r => r.status === 'invalid_url').length,
      parse_error: results.filter(r => r.status === 'parse_error').length,
      timeout: 0, // No estamos usando timeout en API
      navigation_error: results.filter(r => r.status === 'error').length
    };

    console.log(`\n📈 Resumen de extracción:`);
    console.log(`   Total procesado: ${summary.total}`);
    console.log(`   ✅ Exitosos: ${summary.ok}`);
    console.log(`   ⚠️  No encontrados: ${summary.not_found}`);
    console.log(`   ❌ URLs inválidas: ${summary.invalid_url}`);
    console.log(`   🔧 Errores de parseo: ${summary.parse_error}`);
    console.log(`   ⚠️  Otros errores: ${summary.navigation_error}`);

    return {
      results,
      summary
    };
  }
}

export default new ScraperService();
