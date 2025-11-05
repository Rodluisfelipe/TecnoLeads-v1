import { format, parse, isValid } from 'date-fns';

class DataTransformerService {
  // Mapeo de campos SECOP II (formato real) a Odoo CRM
  fieldMapping = {
    // Plantilla SECOP II Real
    'Entidad': 'partner_name',
    'Objeto': 'name', // Descripción del proceso/contrato
    'Cuantía': 'expected_revenue',
    'Modalidad': 'modalidad',
    'Número': 'numero_proceso',
    'Estado': 'stage_name',
    'F. Publicación': 'date_deadline',
    'Ubicación': 'location',
    'Actividad Económica': 'actividad_economica',
    'Códigos UNSPSC': 'codigos_unspsc',
    'Enlace': 'website',
    'Portal de origen': 'portal_origen',
    'Contratista(s)': 'contratistas',
    
    // Compatibilidad con formato anterior (opcional)
    'Nombre del Proceso': 'name',
    'Descripción del Proceso': 'description',
    'Valor del Contrato': 'expected_revenue',
    'Email Contacto': 'email_from',
    'Teléfono Contacto': 'phone',
    'Ciudad': 'city',
    'Departamento': 'state_id',
    'Fecha de Publicación': 'date_deadline',
    'Tipo de Proceso': 'type',
  };

  // Transformar datos de CSV/Excel a formato Odoo
  transformData(records, filePath = null) {
    // Obtener mapa de fechas extraídas (si existe)
    const deadlineMap = filePath && global.deadlineMaps ? global.deadlineMaps[filePath] : null;
    
    if (deadlineMap) {
      console.log(`\n📅 Usando fechas extraídas para ${Object.keys(deadlineMap).length} enlaces`);
    }

    return records.map((record, index) => {
      try {
        return this.transformRecord(record, index, deadlineMap);
      } catch (error) {
        console.error(`Error transformando registro ${index}:`, error);
        return null;
      }
    }).filter(r => r !== null);
  }

  // Transformar un registro individual para Odoo CRM
  transformRecord(record, index, deadlineMap = null) {
    const transformed = {
      type: 'opportunity', // Tipo de oportunidad en Odoo
    };

    // CAMPOS ESTÁNDAR DE ODOO CRM
    
    // Nombre: Modalidad - Número (ej: "Selección Abreviada Subasta Inversa - SASI-029-SG-2025")
    if (record['Modalidad'] && record['Número']) {
      transformed.name = `${record['Modalidad']} - ${record['Número']}`;
    } else if (record['Número']) {
      transformed.name = this.cleanText(record['Número']);
    } else if (record['Nombre del Proceso']) {
      transformed.name = record['Nombre del Proceso'];
    } else if (record['Objeto']) {
      // Fallback: usar primeras palabras del objeto
      transformed.name = record['Objeto'].substring(0, 100);
    }

    // Partner (Cliente/Entidad contratante) - Campo "Contacto" en Odoo
    if (record['Entidad']) {
      transformed.partner_name = this.cleanText(record['Entidad']);
    }

    // Ingreso esperado (Cuantía)
    if (record['Cuantía']) {
      transformed.expected_revenue = this.parseMoneyValue(record['Cuantía']);
    } else if (record['Valor del Contrato']) {
      transformed.expected_revenue = this.parseMoneyValue(record['Valor del Contrato']);
    }

    // Probabilidad (calculada según estado)
    transformed.probability = this.getProbabilityByState(record['Estado']);

    // Fecha de cierre esperado (fecha límite)
    // 1. Prioridad MÁXIMA: Fecha extraída del scraper (si existe)
    // 2. Fallback: "F. Publicación" del CSV
    let fechaAsignada = null;
    
    if (deadlineMap && record['Enlace'] && deadlineMap[record['Enlace']]) {
      fechaAsignada = deadlineMap[record['Enlace']];
      transformed.date_deadline = this.parseDateTimestamp(fechaAsignada);
      transformed.x_cierre_con_hora = this.parseDateTimestamp(fechaAsignada); // Campo personalizado existente
      console.log(`📅 [Lead ${index + 1}] Fecha de cierre extraída: "${fechaAsignada}" → Odoo date_deadline: "${transformed.date_deadline}"`);
      console.log(`📅 [Lead ${index + 1}] x_cierre_con_hora asignado: "${transformed.x_cierre_con_hora}"`);
      
    } else if (record['F. Publicación']) {
      fechaAsignada = record['F. Publicación'];
      transformed.date_deadline = this.parseDateTimestamp(fechaAsignada);
      transformed.x_cierre_con_hora = this.parseDateTimestamp(fechaAsignada);
      console.log(`📅 [Lead ${index + 1}] Fecha de publicación usada: "${fechaAsignada}" → Odoo: "${transformed.date_deadline}"`);
    } else if (record['Fecha de Publicación']) {
      fechaAsignada = record['Fecha de Publicación'];
      transformed.date_deadline = this.parseDateTimestamp(fechaAsignada);
      transformed.x_cierre_con_hora = this.parseDateTimestamp(fechaAsignada);
      console.log(`📅 [Lead ${index + 1}] Fecha de publicación (alt) usada: "${fechaAsignada}" → Odoo: "${transformed.date_deadline}"`);
    } else {
      console.log(`⚠️ [Lead ${index + 1}] No se encontró ninguna fecha para date_deadline`);
    }

    // Email y teléfono (si existen en el CSV)
    // Nota: La plantilla SECOP II NO tiene estos campos, quedarán vacíos
    if (record['Email Contacto']) {
      transformed.email_from = this.cleanEmail(record['Email Contacto']);
    }
    if (record['Teléfono Contacto']) {
      transformed.phone = this.cleanPhone(record['Teléfono Contacto']);
    }

    // Descripción completa del proceso (campo "Notas internas" en Odoo)
    transformed.description = this.buildDescription(record);

    // Website (enlace al proceso SECOP II)
    if (record['Enlace']) {
      transformed.website = this.cleanURL(record['Enlace']);
    }

    // Ciudad (extraída de Ubicación)
    if (record['Ubicación']) {
      const location = this.parseLocation(record['Ubicación']);
      if (location.ciudad) transformed.city = location.ciudad;
      // El departamento irá en la descripción
    }
    
    // Portal de origen → Comentado porque no existe en Odoo 19 por defecto
    // Si necesitas este campo, créalo primero en Odoo como campo personalizado
    /*
    if (record['Portal de origen']) {
      const portalOrigen = this.cleanText(record['Portal de origen']).toUpperCase();
      // Probar diferentes nombres de campo comunes para "Presentación"
      transformed.x_presentacion = portalOrigen;  // Campo personalizado común
      transformed.x_portal = portalOrigen;        // Alternativa
      transformed.x_portal_origen = portalOrigen; // Alternativa
      console.log(`📌 Portal de origen: "${portalOrigen}" → asignado a campos x_presentacion/x_portal`);
    }
    */
    
    // Actividad Económica → Se convertirá en tag "Etiquetas"
    if (record['Actividad Económica']) {
      transformed.actividad_economica = this.cleanText(record['Actividad Económica']);
    }
    
    // NOTA: Los campos personalizados (x_*) están desactivados por defecto
    // Toda la información adicional (modalidad, códigos UNSPSC, etc.) 
    // se incluye en la descripción formateada.
    // 
    // Si deseas habilitar campos personalizados:
    // 1. Crea los campos en Odoo (ver CONFIGURACION_ODOO_CAMPOS.md)
    // 2. Descomenta el código a continuación
    
    /*
    // CAMPOS PERSONALIZADOS DE ODOO (x_)
    // SOLO habilitar si creaste los campos en Odoo
    
    if (record['Modalidad']) {
      transformed.x_modalidad = this.cleanText(record['Modalidad']);
    }
    if (record['Número']) {
      transformed.x_numero_proceso = this.cleanText(record['Número']);
    }
    if (record['Estado']) {
      transformed.x_estado = this.cleanText(record['Estado']);
    }
    if (record['Actividad Económica']) {
      transformed.x_actividad_economica = this.cleanText(record['Actividad Económica']);
    }
    if (record['Códigos UNSPSC']) {
      transformed.x_codigos_unspsc = this.cleanText(record['Códigos UNSPSC']);
    }
    if (record['Portal de origen']) {
      transformed.x_portal_origen = this.cleanText(record['Portal de origen']);
    }
    if (record['Ubicación']) {
      const location = this.parseLocation(record['Ubicación']);
      if (location.departamento) transformed.x_departamento = location.departamento;
    }
    if (record['Contratista(s)'] && record['Contratista(s)'].trim()) {
      transformed.x_contratistas = this.cleanText(record['Contratista(s)']);
    }
    */

    // Validaciones básicas
    if (!transformed.name) {
      throw new Error('El nombre del proceso es requerido');
    }

    return transformed;
  }
  
  // Obtener versión corta de la modalidad
  getModalidadCorta(modalidad) {
    const modalidadMap = {
      'Selección Abreviada Subasta Inversa': 'Subasta',
      'Selección abreviada de menor cuantía': 'SAMC',
      'Contratación mínima cuantía': 'MC',
      'Licitación Pública': 'Licitación',
      'Concurso de Méritos': 'Concurso',
    };
    
    return modalidadMap[modalidad] || modalidad.split(' ')[0];
  }
  
  // Obtener probabilidad según el estado
  getProbabilityByState(estado) {
    if (!estado) return 10;
    
    const estadoLower = estado.toLowerCase();
    
    if (estadoLower.includes('convocatoria') || estadoLower.includes('publicado')) return 25;
    if (estadoLower.includes('evaluación') || estadoLower.includes('evaluacion')) return 50;
    if (estadoLower.includes('adjudicado') || estadoLower.includes('celebrado')) return 100;
    if (estadoLower.includes('desierto') || estadoLower.includes('cancelado')) return 0;
    
    return 10; // Default
  }
  
  // Parsear ubicación (formato: "Departamento : Ciudad")
  parseLocation(location) {
    const result = { departamento: null, ciudad: null };
    
    if (!location) return result;
    
    const parts = location.toString().split(':').map(p => p.trim());
    if (parts.length === 2) {
      result.departamento = parts[0];
      result.ciudad = parts[1];
    } else {
      result.ciudad = location.toString().trim();
    }
    
    return result;
  }
  
  // Construir descripción completa del proceso (simplificada)
  buildDescription(record) {
    const parts = [];
    
    // Objeto del contrato (resumido si es muy largo)
    if (record['Objeto']) {
      const objeto = record['Objeto'];
      const objetoCorto = objeto.length > 200 ? objeto.substring(0, 200) + '...' : objeto;
      parts.push(objetoCorto);
      parts.push('');
    }
    
    // Información clave en formato compacto
    const info = [];
    if (record['Modalidad']) info.push(`📋 ${record['Modalidad']}`);
    if (record['Estado']) info.push(`📊 ${record['Estado']}`);
    if (record['Ubicación']) info.push(`📍 ${record['Ubicación']}`);
    
    if (info.length > 0) {
      parts.push(info.join(' | '));
      parts.push('');
    }
    
    // Actividad y códigos en una línea
    if (record['Actividad Económica']) {
      const actividad = record['Actividad Económica'];
      const actividadCorta = actividad.length > 100 ? actividad.substring(0, 100) + '...' : actividad;
      parts.push(`🏷️ ${actividadCorta}`);
    }
    if (record['Códigos UNSPSC']) {
      parts.push(`🔖 UNSPSC: ${record['Códigos UNSPSC']}`);
    }
    
    // Enlace
    if (record['Enlace']) {
      parts.push('');
      parts.push(`🔗 ${record['Enlace']}`);
    }
    
    return parts.join('\n');
  }
  
  // Formatear valor monetario para visualización
  formatMoney(value) {
    if (!value) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Transformar valor según el tipo de campo
  transformValue(fieldName, value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (fieldName) {
      case 'expected_revenue':
        return this.parseMoneyValue(value);
      
      case 'date_deadline':
        return this.parseDateTimestamp(value);
      
      case 'phone':
        return this.cleanPhone(value);
      
      case 'email_from':
        return this.cleanEmail(value);
      
      case 'name':
      case 'description':
      case 'partner_name':
      case 'modalidad':
      case 'numero_proceso':
      case 'actividad_economica':
      case 'portal_origen':
        return this.cleanText(value);
      
      case 'website':
        return this.cleanURL(value);
      
      default:
        return value.toString().trim();
    }
  }
  
  // Limpiar URL
  cleanURL(value) {
    if (!value) return null;
    const url = value.toString().trim();
    // Validación básica de URL
    try {
      new URL(url);
      return url;
    } catch {
      return url.startsWith('http') ? url : `https://${url}`;
    }
  }

  // Parsear valores monetarios
  parseMoneyValue(value) {
    if (typeof value === 'number') {
      return value;
    }

    // Eliminar símbolos de moneda, puntos y comas
    const cleaned = value.toString()
      .replace(/[$,\.]/g, '')
      .replace(/\s/g, '')
      .trim();

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Parsear fechas (formato SECOP II: "2025-10-20 18:31:50")
  parseDateTimestamp(value) {
    if (!value) return null;

    try {
      // Si ya es una fecha válida
      if (value instanceof Date && isValid(value)) {
        return format(value, 'yyyy-MM-dd HH:mm:ss');
      }

      const strValue = value.toString().trim();
      
      // Formato SECOP II con hora: "YYYY-MM-DD HH:mm:ss" (ya en formato correcto)
      if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(strValue)) {
        const date = parse(strValue, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (isValid(date)) {
          // Odoo espera formato: "YYYY-MM-DD HH:MM:SS"
          return format(date, 'yyyy-MM-dd HH:mm:ss');
        }
      }
      
      // Formato SECOP II con espacio: "YYYY-MM-DD HH:mm:ss"
      if (strValue.includes(' ')) {
        const datePart = strValue.split(' ')[0];
        const timePart = strValue.split(' ')[1] || '00:00:00';
        const date = parse(`${datePart} ${timePart}`, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (isValid(date)) {
          // Odoo espera formato: "YYYY-MM-DD HH:MM:SS"
          return format(date, 'yyyy-MM-dd HH:mm:ss');
        }
      }

      // Intentar formatos solo fecha (sin hora) - agregar hora 00:00:00
      const formats = [
        'yyyy-MM-dd',
        'dd/MM/yyyy',
        'MM/dd/yyyy',
        'dd-MM-yyyy',
        'yyyy/MM/dd',
      ];

      for (const fmt of formats) {
        try {
          const date = parse(strValue, fmt, new Date());
          if (isValid(date)) {
            // Odoo espera formato: "YYYY-MM-DD HH:MM:SS" (con hora completa)
            return format(date, 'yyyy-MM-dd HH:mm:ss');
          }
        } catch (e) {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('Error parseando fecha:', error);
      return null;
    }
  }
  
  // Mantener parseDate para compatibilidad
  parseDate(value) {
    return this.parseDateTimestamp(value);
  }

  // Limpiar teléfono
  cleanPhone(value) {
    if (!value) return null;
    
    // Eliminar caracteres no numéricos excepto + al inicio
    return value.toString()
      .replace(/[^\d+]/g, '')
      .trim();
  }

  // Limpiar email
  cleanEmail(value) {
    if (!value) return null;
    
    const email = value.toString().toLowerCase().trim();
    
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : null;
  }

  // Limpiar texto
  cleanText(value) {
    if (!value) return '';
    
    return value.toString()
      .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
      .replace(/[\r\n]+/g, ' ') // Saltos de línea a espacio
      .trim();
  }

  // Generar estadísticas del archivo
  generateStats(records) {
    const stats = {
      totalRecords: records.length,
      totalValue: 0,
      averageValue: 0,
      recordsWithEmail: 0,
      recordsWithPhone: 0,
      cityCounts: {},
      typeCounts: {},
      estadoCounts: {},
      modalidadCounts: {},
    };

    records.forEach(record => {
      // Valor total (Cuantía o Valor del Contrato)
      const valueField = record['Cuantía'] || record['Valor del Contrato'];
      if (valueField) {
        const value = this.parseMoneyValue(valueField);
        stats.totalValue += value;
      }

      // Emails
      if (record['Email Contacto']) {
        stats.recordsWithEmail++;
      }

      // Teléfonos
      if (record['Teléfono Contacto']) {
        stats.recordsWithPhone++;
      }

      // Contar por ubicación
      if (record['Ubicación']) {
        const location = this.parseLocation(record['Ubicación']);
        if (location.ciudad) {
          stats.cityCounts[location.ciudad] = (stats.cityCounts[location.ciudad] || 0) + 1;
        }
      } else if (record['Ciudad']) {
        stats.cityCounts[record['Ciudad']] = (stats.cityCounts[record['Ciudad']] || 0) + 1;
      }

      // Contar por modalidad
      if (record['Modalidad']) {
        stats.modalidadCounts[record['Modalidad']] = (stats.modalidadCounts[record['Modalidad']] || 0) + 1;
      } else if (record['Tipo de Proceso']) {
        stats.typeCounts[record['Tipo de Proceso']] = (stats.typeCounts[record['Tipo de Proceso']] || 0) + 1;
      }
      
      // Contar por estado
      if (record['Estado']) {
        stats.estadoCounts[record['Estado']] = (stats.estadoCounts[record['Estado']] || 0) + 1;
      }
    });

    stats.averageValue = stats.totalRecords > 0 
      ? stats.totalValue / stats.totalRecords 
      : 0;

    return stats;
  }

  // Validar estructura del archivo
  validateStructure(headers) {
    // Aceptar tanto el formato nuevo (SECOP II) como el anterior
    const requiredFieldsNew = ['Entidad', 'Objeto'];
    const requiredFieldsOld = ['Nombre del Proceso'];
    
    const hasNewFormat = requiredFieldsNew.every(field => headers.includes(field));
    const hasOldFormat = requiredFieldsOld.every(field => headers.includes(field));
    
    if (!hasNewFormat && !hasOldFormat) {
      return {
        valid: false,
        message: `El archivo debe contener al menos los campos: ${requiredFieldsNew.join(', ')} o ${requiredFieldsOld.join(', ')}`,
        missingFields: requiredFieldsNew,
      };
    }

    return {
      valid: true,
      message: 'Estructura válida',
      format: hasNewFormat ? 'SECOP II' : 'Formato anterior',
    };
  }
}

export default new DataTransformerService();

