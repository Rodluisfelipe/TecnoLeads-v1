import puppeteer from 'puppeteer';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { parse, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';

class ScraperService {
  constructor() {
    this.browser = null;
    this.timezone = 'America/Bogota';
    
    // Mapeo de meses en español
    this.monthMap = {
      'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'ago': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
    };
  }

  // 🚀 Inicializar navegador
  async initBrowser() {
    if (!this.browser) {
      console.log('🌐 Iniciando navegador headless...');
      
      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080'
        ]
      };

      // En producción (Render), usar Chrome instalado por Puppeteer
      if (process.env.NODE_ENV === 'production') {
        launchOptions.executablePath = '/opt/render/.cache/puppeteer/chrome/linux-142.0.7444.59/chrome-linux64/chrome';
      }

      this.browser = await puppeteer.launch(launchOptions);
    }
    return this.browser;
  }

  // 🛑 Cerrar navegador
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🛑 Navegador cerrado');
    }
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

  // 📅 Extraer fecha de presentación de ofertas de una URL
  async extractDeadlineDate(url, retries = 1) {
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

    let page = null;

    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();

      // Configurar User-Agent estándar
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Configurar timeout
      await page.setDefaultNavigationTimeout(60000);
      await page.setDefaultTimeout(60000);

      console.log(`🔍 Visitando: ${url}`);

      // Navegar a la URL
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
      });

      // Esperar a que el contenido dinámico cargue
      // Esperamos el contenedor principal o un timeout de 10s
      try {
        await page.waitForSelector('.contenido-detalle-contrato', { timeout: 10000 });
      } catch (e) {
        console.warn('⚠️ Selector .contenido-detalle-contrato no encontrado, intentando búsqueda alternativa...');
      }

      // 🔄 ESPERAR ADICIONAL: Las fechas se cargan dinámicamente
      console.log('⏳ Esperando carga completa de fechas dinámicas...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Esperar 3 segundos adicionales

      // Esperar específicamente a que aparezca "Presentación de Ofertas"
      try {
        await page.waitForFunction(
          () => {
            const elements = document.querySelectorAll('b.d-block');
            for (const el of elements) {
              if (el.textContent.toLowerCase().includes('presentación de ofertas')) {
                return true;
              }
            }
            return false;
          },
          { timeout: 5000 } // Esperar hasta 5 segundos más
        );
        console.log('✅ "Presentación de Ofertas" detectado en la página');
      } catch (e) {
        console.warn('⚠️ No se detectó "Presentación de Ofertas" después de esperar');
      }

      // LOG: Depuración - extraer todo el contenido de los contenedores
      const debugInfo = await page.evaluate(() => {
        const containers = document.querySelectorAll('.contenido-detalle-contrato');
        const data = [];
        containers.forEach((container, idx) => {
          const boldElement = container.querySelector('b.d-block');
          const infoElement = container.querySelector('.info-contrato p.d-block');
          data.push({
            index: idx,
            boldText: boldElement ? boldElement.textContent.trim() : null,
            infoText: infoElement ? infoElement.textContent.trim() : null
          });
        });
        return { totalContainers: containers.length, containers: data };
      });
      console.log('🔍 DEBUG - Contenedores encontrados:', JSON.stringify(debugInfo, null, 2));

      // Extraer fecha usando evaluación en el contexto del navegador
      const dateInfo = await page.evaluate(() => {
        // Buscar el contenedor con "Presentación de Ofertas"
        const containers = document.querySelectorAll('.contenido-detalle-contrato');
        
        for (const container of containers) {
          const boldElement = container.querySelector('b.d-block');
          if (boldElement) {
            const boldText = boldElement.textContent.toLowerCase().trim();
            // Buscar con o sin dos puntos
            if (boldText.includes('presentación de ofertas')) {
              const infoElement = container.querySelector('.info-contrato p.d-block');
              if (infoElement) {
                return {
                  found: true,
                  rawDate: infoElement.textContent.trim()
                };
              }
            }
          }
        }

        // Búsqueda alternativa: cualquier elemento que contenga "Presentación de Ofertas"
        const allElements = document.querySelectorAll('b, strong, h3, h4');
        for (const el of allElements) {
          const elText = el.textContent.toLowerCase().trim();
          if (elText.includes('presentación de ofertas')) {
            // Buscar el siguiente elemento que parezca una fecha
            let sibling = el.nextElementSibling;
            let attempts = 0;
            while (sibling && attempts < 5) {
              const text = sibling.textContent.trim();
              // Patrón: algo como "30/Oct/2025 - 06:00 pm"
              if (/\d{1,2}\/[a-zA-Z]{3}\/\d{4}\s*-\s*\d{1,2}:\d{2}\s*(am|pm)/i.test(text)) {
                return {
                  found: true,
                  rawDate: text
                };
              }
              sibling = sibling.nextElementSibling;
              attempts++;
            }
            
            // Búsqueda alternativa: buscar en el mismo contenedor padre
            const parent = el.parentElement;
            if (parent) {
              const parentText = parent.textContent;
              const dateMatch = parentText.match(/\d{1,2}\/[a-zA-Z]{3}\/\d{4}\s*-\s*\d{1,2}:\d{2}\s*(am|pm)/i);
              if (dateMatch) {
                return {
                  found: true,
                  rawDate: dateMatch[0]
                };
              }
            }
          }
        }

        // Última búsqueda: buscar cualquier cosa que parezca una fecha en toda la página
        const bodyText = document.body.textContent;
        const allDates = bodyText.match(/\d{1,2}\/[a-zA-Z]{3}\/\d{4}\s*-\s*\d{1,2}:\d{2}\s*(am|pm)/gi);
        if (allDates && allDates.length > 0) {
          // Si hay múltiples fechas, intentar encontrar la que está cerca de "Presentación de Ofertas"
          const presentacionIndex = bodyText.toLowerCase().indexOf('presentación de ofertas');
          if (presentacionIndex !== -1) {
            // Buscar la fecha más cercana después del texto
            for (const dateStr of allDates) {
              const dateIndex = bodyText.indexOf(dateStr, presentacionIndex);
              if (dateIndex !== -1 && dateIndex < presentacionIndex + 200) {
                return {
                  found: true,
                  rawDate: dateStr
                };
              }
            }
          }
        }

        return { found: false };
      });

      console.log('🔍 DEBUG - Resultado de dateInfo:', JSON.stringify(dateInfo, null, 2));

      await page.close();

      if (!dateInfo.found) {
        console.log(`❌ No se encontró fecha en ${url}`);
        return {
          enlace: url,
          raw: null,
          normalized: null,
          status: 'not_found',
          meta: { reason: 'No se encontró el bloque "Presentación de Ofertas"' }
        };
      }

      console.log(`✅ Fecha encontrada en ${url}: "${dateInfo.rawDate}"`);

      // Parsear la fecha al formato estándar
      const parsed = this.parseDeadlineDate(dateInfo.rawDate);

      return {
        enlace: url,
        raw: dateInfo.rawDate,
        normalized: parsed.normalized,
        status: parsed.normalized ? 'ok' : 'parse_error',
        meta: parsed.normalized ? {} : { reason: 'Error al parsear la fecha', error: parsed.error }
      };

    } catch (error) {
      if (page) await page.close();

      console.error(`❌ Error extrayendo fecha de ${url}:`, error.message);

      // Reintentar una vez en caso de timeout o error de navegación
      if (retries > 0 && (error.name === 'TimeoutError' || error.message.includes('navigation'))) {
        console.log(`🔄 Reintentando... (${retries} intentos restantes)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s
        return this.extractDeadlineDate(url, retries - 1);
      }

      return {
        enlace: url,
        raw: null,
        normalized: null,
        status: error.name === 'TimeoutError' ? 'timeout' : 'navigation_error',
        meta: { reason: error.message }
      };
    }
  }

  // 📅 Parsear fecha cruda al formato estándar YYYY-MM-DD HH:MM:SS
  // IMPORTANTE: Odoo interpreta las fechas como UTC y las convierte a la zona horaria del usuario
  // Para que en Odoo aparezca 9:00 am, necesitamos SUMAR 5 horas (UTC-5 de Colombia)
  parseDeadlineDate(rawDate) {
    try {
      // Formato esperado: "30/Oct/2025 - 06:00 pm"
      const regex = /(\d{1,2})\/([a-zA-Z]{3})\/(\d{4})\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm)/i;
      const match = rawDate.match(regex);

      if (!match) {
        return { normalized: null, error: 'Formato no coincide con DD/Mon/YYYY - hh:mm am|pm' };
      }

      const [, day, monthStr, year, hour, minute, ampm] = match;

      // Convertir mes español a número
      const monthLower = monthStr.toLowerCase();
      const month = this.monthMap[monthLower];

      if (!month) {
        return { normalized: null, error: `Mes desconocido: ${monthStr}` };
      }

      // Convertir hora 12h a 24h
      let hour24 = parseInt(hour, 10);
      if (ampm.toLowerCase() === 'pm' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm.toLowerCase() === 'am' && hour24 === 12) {
        hour24 = 0;
      }

      // Crear objeto Date con la hora original
      const originalDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour24, parseInt(minute), 0);
      
      // SUMAR 5 horas para compensar la conversión de Odoo (UTC-5 → UTC)
      const adjustedDate = new Date(originalDate.getTime() + (5 * 60 * 60 * 1000));
      
      // Formatear la fecha ajustada
      const adjYear = adjustedDate.getFullYear();
      const adjMonth = String(adjustedDate.getMonth() + 1).padStart(2, '0');
      const adjDay = String(adjustedDate.getDate()).padStart(2, '0');
      const adjHour = String(adjustedDate.getHours()).padStart(2, '0');
      const adjMinute = String(adjustedDate.getMinutes()).padStart(2, '0');
      const adjSecond = String(adjustedDate.getSeconds()).padStart(2, '0');

      const normalized = `${adjYear}-${adjMonth}-${adjDay} ${adjHour}:${adjMinute}:${adjSecond}`;

      console.log(`📅 Fecha parseada: "${rawDate}" → "${normalized}" (ajustada +5h para Odoo)`);

      return { normalized };

    } catch (error) {
      return { normalized: null, error: error.message };
    }
  }

  // 🔄 Procesar múltiples URLs en lotes
  async extractDeadlineDatesFromRows(rows, batchSize = 5) {
    console.log(`\n📊 Extrayendo fechas de cierre de ${rows.length} registros...`);
    console.log(`⚙️  Procesando en lotes de ${batchSize} URLs concurrentes\n`);

    const results = [];
    
    // Procesar en lotes para no sobrecargar
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`📦 Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)} (${batch.length} URLs)...`);

      const batchPromises = batch.map(row => {
        const url = row.Enlace || row.enlace || row.url;
        return this.extractDeadlineDate(url);
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      console.log(`✅ Lote completado: ${batchResults.filter(r => r.status === 'ok').length}/${batch.length} exitosos\n`);

      // Pausa breve entre lotes para no saturar el servidor
      if (i + batchSize < rows.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Cerrar navegador al finalizar
    await this.closeBrowser();

    const summary = {
      total: results.length,
      ok: results.filter(r => r.status === 'ok').length,
      not_found: results.filter(r => r.status === 'not_found').length,
      invalid_url: results.filter(r => r.status === 'invalid_url').length,
      parse_error: results.filter(r => r.status === 'parse_error').length,
      timeout: results.filter(r => r.status === 'timeout').length,
      navigation_error: results.filter(r => r.status === 'navigation_error').length,
    };

    console.log(`\n📈 Resumen de extracción:`);
    console.log(`   Total procesado: ${summary.total}`);
    console.log(`   ✅ Exitosos: ${summary.ok}`);
    console.log(`   ⚠️  No encontrados: ${summary.not_found}`);
    console.log(`   ❌ URLs inválidas: ${summary.invalid_url}`);
    console.log(`   🔧 Errores de parseo: ${summary.parse_error}`);
    console.log(`   ⏱️  Timeouts: ${summary.timeout}`);
    console.log(`   🚫 Errores de navegación: ${summary.navigation_error}\n`);

    return {
      results,
      summary
    };
  }
}

export default new ScraperService();
