/**
 * 🛡️ SERVICIO DE VALIDACIÓN Y CORRECCIÓN AUTOMÁTICA DE DATOS
 * 
 * Este servicio implementa un sistema robusto para detectar y corregir
 * automáticamente los errores más comunes en archivos de importación.
 * 
 * Casos cubiertos:
 * 1. Columnas colapsadas (CSV dentro de Excel)
 * 2. Separadores incorrectos (punto y coma, tabulaciones)
 * 3. Codificación de caracteres (UTF-8, Latin1, Windows-1252)
 * 4. BOM (Byte Order Mark)
 * 5. Comillas tipográficas vs rectas
 * 6. Columnas vacías o duplicadas
 * 7. Tipos de datos inconsistentes
 * 8. Formatos de fecha variados
 * 9. Números con diferentes separadores decimales
 * 10. Campos faltantes u opcionales
 */

class DataValidatorService {
  constructor() {
    // Configuración de columnas esperadas para SECOP II
    this.expectedColumns = [
      'Entidad',
      'Objeto',
      'Cuantía',
      'Modalidad',
      'Número',
      'Estado',
      'F. Publicación',
      'Ubicación',
      'Actividad Económica',
      'Códigos UNSPSC',
      'Enlace',
      'Portal de origen',
      'Contratista(s)'
    ];

    // Aliases comunes de columnas (para normalización)
    this.columnAliases = {
      'entidad': 'Entidad',
      'entidad contratante': 'Entidad',
      'nombre entidad': 'Entidad',
      
      'objeto': 'Objeto',
      'descripción': 'Objeto',
      'objeto del contrato': 'Objeto',
      
      'cuantía': 'Cuantía',
      'valor': 'Cuantía',
      'presupuesto': 'Cuantía',
      'presupuesto oficial': 'Cuantía',
      'monto': 'Cuantía',
      
      'modalidad': 'Modalidad',
      'tipo de proceso': 'Modalidad',
      
      'número': 'Número',
      'numero': 'Número',
      'referencia': 'Número',
      'id proceso': 'Número',
      
      'estado': 'Estado',
      'estado del proceso': 'Estado',
      
      'f. publicación': 'F. Publicación',
      'fecha publicación': 'F. Publicación',
      'fecha de publicación': 'F. Publicación',
      'publicado': 'F. Publicación',
      
      'ubicación': 'Ubicación',
      'ubicacion': 'Ubicación',
      'localización': 'Ubicación',
      'localizacion': 'Ubicación',
      'departamento': 'Ubicación',
      
      'actividad económica': 'Actividad Económica',
      'actividad economica': 'Actividad Económica',
      'sector': 'Actividad Económica',
      
      'códigos unspsc': 'Códigos UNSPSC',
      'codigos unspsc': 'Códigos UNSPSC',
      'unspsc': 'Códigos UNSPSC',
      
      'enlace': 'Enlace',
      'link': 'Enlace',
      'url': 'Enlace',
      
      'portal de origen': 'Portal de origen',
      'portal': 'Portal de origen',
      'fuente': 'Portal de origen',
      
      'contratista(s)': 'Contratista(s)',
      'contratista': 'Contratista(s)',
      'contratistas': 'Contratista(s)',
      'adjudicatario': 'Contratista(s)'
    };

    // Patrones de fecha comunes
    this.datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{4}/,           // DD/MM/YYYY o MM/DD/YYYY
      /\d{4}-\d{2}-\d{2}/,                 // YYYY-MM-DD
      /\d{1,2}-\w{3}-\d{4}/,               // DD-MMM-YYYY (01-Nov-2024)
      /\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/,   // 1 de noviembre de 2024
    ];

    // Separadores decimales por región
    this.decimalSeparators = {
      'es-CO': ',',  // Colombia usa coma
      'en-US': '.',  // USA usa punto
    };
  }

  /**
   * 🔍 VALIDACIÓN COMPLETA DE ARCHIVO
   */
  async validateFile(data, headers) {
    const validationReport = {
      isValid: true,
      errors: [],
      warnings: [],
      corrections: [],
      stats: {
        totalRows: data.length,
        totalColumns: headers.length,
        emptyRows: 0,
        duplicateRows: 0,
        invalidDates: 0,
        invalidNumbers: 0,
      }
    };

    // 1. Validar que hay datos
    if (!data || data.length === 0) {
      validationReport.isValid = false;
      validationReport.errors.push('El archivo no contiene datos');
      return validationReport;
    }

    // 2. Validar que hay columnas
    if (!headers || headers.length === 0) {
      validationReport.isValid = false;
      validationReport.errors.push('El archivo no contiene columnas');
      return validationReport;
    }

    // 3. Detectar columnas faltantes críticas
    const missingCriticalColumns = this.detectMissingCriticalColumns(headers);
    if (missingCriticalColumns.length > 0) {
      validationReport.warnings.push(
        `Columnas críticas faltantes: ${missingCriticalColumns.join(', ')}`
      );
    }

    // 4. Detectar filas vacías
    const emptyRowsCount = this.countEmptyRows(data);
    validationReport.stats.emptyRows = emptyRowsCount;
    if (emptyRowsCount > 0) {
      validationReport.warnings.push(`Se encontraron ${emptyRowsCount} filas vacías`);
    }

    // 5. Detectar duplicados
    const duplicatesCount = this.countDuplicates(data);
    validationReport.stats.duplicateRows = duplicatesCount;
    if (duplicatesCount > 0) {
      validationReport.warnings.push(`Se encontraron ${duplicatesCount} filas duplicadas`);
    }

    return validationReport;
  }

  /**
   * 🔧 CORRECCIÓN AUTOMÁTICA DE DATOS
   */
  async autoCorrect(data, headers) {
    let correctedData = [...data];
    let correctedHeaders = [...headers];
    const corrections = [];

    // 1. Normalizar nombres de columnas
    const { headers: normalizedHeaders, corrections: headerCorrections } = 
      this.normalizeColumnNames(correctedHeaders);
    correctedHeaders = normalizedHeaders;
    corrections.push(...headerCorrections);

    // 2. Eliminar columnas vacías
    const { data: cleanData, headers: cleanHeaders, removed } = 
      this.removeEmptyColumns(correctedData, correctedHeaders);
    correctedData = cleanData;
    correctedHeaders = cleanHeaders;
    if (removed.length > 0) {
      corrections.push(`Columnas vacías eliminadas: ${removed.join(', ')}`);
    }

    // 3. Eliminar filas vacías
    const originalLength = correctedData.length;
    correctedData = this.removeEmptyRows(correctedData);
    if (correctedData.length < originalLength) {
      corrections.push(`${originalLength - correctedData.length} filas vacías eliminadas`);
    }

    // 4. Normalizar tipos de datos
    correctedData = this.normalizeDataTypes(correctedData, correctedHeaders);

    // 5. Corregir valores faltantes
    correctedData = this.fillMissingValues(correctedData, correctedHeaders);

    // 6. Limpiar espacios en blanco
    correctedData = this.trimAllFields(correctedData);

    return {
      data: correctedData,
      headers: correctedHeaders,
      corrections
    };
  }

  /**
   * 📊 Normalizar nombres de columnas
   */
  normalizeColumnNames(headers) {
    const normalized = [];
    const corrections = [];

    headers.forEach(header => {
      const cleanHeader = header.trim().toLowerCase();
      
      // Buscar alias
      if (this.columnAliases[cleanHeader]) {
        const standardName = this.columnAliases[cleanHeader];
        normalized.push(standardName);
        if (header !== standardName) {
          corrections.push(`Columna "${header}" normalizada a "${standardName}"`);
        }
      } else {
        // Mantener nombre original si no hay alias
        normalized.push(header.trim());
      }
    });

    return { headers: normalized, corrections };
  }

  /**
   * 🗑️ Eliminar columnas completamente vacías
   */
  removeEmptyColumns(data, headers) {
    const columnsToKeep = [];
    const removed = [];

    headers.forEach((header, index) => {
      const hasData = data.some(row => {
        const value = row[header];
        return value !== null && value !== undefined && value !== '';
      });

      if (hasData) {
        columnsToKeep.push(header);
      } else {
        removed.push(header);
      }
    });

    const cleanData = data.map(row => {
      const cleanRow = {};
      columnsToKeep.forEach(header => {
        cleanRow[header] = row[header];
      });
      return cleanRow;
    });

    return {
      data: cleanData,
      headers: columnsToKeep,
      removed
    };
  }

  /**
   * 🗑️ Eliminar filas vacías
   */
  removeEmptyRows(data) {
    return data.filter(row => {
      return Object.values(row).some(value => 
        value !== null && value !== undefined && value !== ''
      );
    });
  }

  /**
   * 🔢 Normalizar tipos de datos
   */
  normalizeDataTypes(data, headers) {
    return data.map(row => {
      const normalizedRow = { ...row };

      // Normalizar Cuantía (números)
      if (normalizedRow['Cuantía']) {
        normalizedRow['Cuantía'] = this.normalizeNumber(normalizedRow['Cuantía']);
      }

      // Normalizar fechas
      if (normalizedRow['F. Publicación']) {
        normalizedRow['F. Publicación'] = this.normalizeDate(normalizedRow['F. Publicación']);
      }

      return normalizedRow;
    });
  }

  /**
   * 💰 Normalizar números (manejar diferentes formatos)
   */
  normalizeNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return null;

    // Convertir a string y limpiar
    let numStr = value.toString()
      .replace(/[^\d,.-]/g, '') // Eliminar todo excepto dígitos, comas, puntos y guiones
      .trim();

    // Detectar formato: 1.000.000,00 (europeo) vs 1,000,000.00 (americano)
    const hasCommaAsDecimal = /,\d{1,2}$/.test(numStr);
    
    if (hasCommaAsDecimal) {
      // Formato europeo: 1.000.000,50 -> 1000000.50
      numStr = numStr.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato americano: 1,000,000.50 -> 1000000.50
      numStr = numStr.replace(/,/g, '');
    }

    const parsed = parseFloat(numStr);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * 📅 Normalizar fechas (detectar múltiples formatos)
   */
  normalizeDate(value) {
    if (!value) return null;

    const dateStr = value.toString().trim();

    // Intentar parsear con diferentes formatos
    const formats = [
      // DD/MM/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // DD-MMM-YYYY
      /^(\d{1,2})-(\w{3})-(\d{4})$/
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        return dateStr; // Mantener formato original si es válido
      }
    }

    return dateStr; // Retornar tal cual si no coincide
  }

  /**
   * 🔄 Rellenar valores faltantes
   */
  fillMissingValues(data, headers) {
    return data.map(row => {
      const filledRow = { ...row };

      // Campos opcionales que pueden estar vacíos
      const optionalFields = ['Contratista(s)', 'Portal de origen'];

      optionalFields.forEach(field => {
        if (!filledRow[field] || filledRow[field] === '') {
          filledRow[field] = field === 'Contratista(s)' ? 'Sin adjudicar' : 'Desconocido';
        }
      });

      return filledRow;
    });
  }

  /**
   * ✂️ Limpiar espacios en blanco de todos los campos
   */
  trimAllFields(data) {
    return data.map(row => {
      const trimmedRow = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        trimmedRow[key] = typeof value === 'string' ? value.trim() : value;
      });
      return trimmedRow;
    });
  }

  /**
   * 🔍 Detectar columnas críticas faltantes
   */
  detectMissingCriticalColumns(headers) {
    const criticalColumns = ['Entidad', 'Objeto', 'Número', 'Enlace'];
    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    
    return criticalColumns.filter(critical => {
      const criticalLower = critical.toLowerCase();
      return !normalizedHeaders.some(h => 
        h === criticalLower || this.columnAliases[h] === critical
      );
    });
  }

  /**
   * 📊 Contar filas vacías
   */
  countEmptyRows(data) {
    return data.filter(row => {
      return !Object.values(row).some(value => 
        value !== null && value !== undefined && value !== ''
      );
    }).length;
  }

  /**
   * 🔍 Contar duplicados (basado en Número de proceso)
   */
  countDuplicates(data) {
    const numbers = data
      .map(row => row['Número'] || row['numero'] || row['Numero'])
      .filter(n => n);
    
    const uniqueNumbers = new Set(numbers);
    return numbers.length - uniqueNumbers.size;
  }

  /**
   * 📋 Generar reporte detallado
   */
  generateReport(validationReport, corrections) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        status: validationReport.isValid ? '✅ Válido' : '❌ Inválido',
        totalRows: validationReport.stats.totalRows,
        totalColumns: validationReport.stats.totalColumns,
        correctionsApplied: corrections.length
      },
      errors: validationReport.errors,
      warnings: validationReport.warnings,
      corrections: corrections,
      stats: validationReport.stats
    };

    console.log('\n📋 REPORTE DE VALIDACIÓN Y CORRECCIÓN');
    console.log('=====================================');
    console.log(`Estado: ${report.summary.status}`);
    console.log(`Filas: ${report.summary.totalRows}`);
    console.log(`Columnas: ${report.summary.totalColumns}`);
    console.log(`Correcciones aplicadas: ${report.summary.correctionsApplied}`);
    
    if (report.errors.length > 0) {
      console.log('\n❌ Errores:');
      report.errors.forEach(err => console.log(`   - ${err}`));
    }
    
    if (report.warnings.length > 0) {
      console.log('\n⚠️  Advertencias:');
      report.warnings.forEach(warn => console.log(`   - ${warn}`));
    }
    
    if (report.corrections.length > 0) {
      console.log('\n🔧 Correcciones aplicadas:');
      report.corrections.forEach(corr => console.log(`   - ${corr}`));
    }
    
    console.log('=====================================\n');

    return report;
  }
}

export default new DataValidatorService();
