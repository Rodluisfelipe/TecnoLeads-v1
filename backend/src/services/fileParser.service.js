import fs from 'fs';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import path from 'path';
import dataValidatorService from './dataValidator.service.js';

class FileParserService {
  // Parsear archivo CSV
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const file = fs.readFileSync(filePath, 'utf8');
      
      // 🔧 LIMPIEZA AUTOMÁTICA DE FORMATO
      let cleanedFile = this.cleanCSVFormat(file);
      
      Papa.parse(cleanedFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Cambiado a false para preservar datos
        delimiter: ',',
        quoteChar: '"',
        escapeChar: '"',
        newline: '\n',
        trimHeaders: true,
        trimFields: true,
        complete: (results) => {
          // Validar que se parsearon columnas correctamente
          if (!results.meta.fields || results.meta.fields.length < 3) {
            reject(new Error(
              'El archivo CSV tiene un formato inválido. ' +
              'Asegúrate de que los encabezados estén correctamente separados por comas. ' +
              'Columnas detectadas: ' + (results.meta.fields?.length || 0)
            ));
            return;
          }
          
          console.log(`✅ CSV parseado: ${results.meta.fields.length} columnas, ${results.data.length} registros`);
          console.log(`📋 Columnas: ${results.meta.fields.join(', ')}`);
          
          resolve({
            data: results.data,
            headers: results.meta.fields,
            rowCount: results.data.length,
          });
        },
        error: (error) => {
          reject(new Error(`Error parseando CSV: ${error.message}`));
        },
      });
    });
  }

  // 🔧 Limpiar y corregir formato CSV automáticamente
  cleanCSVFormat(fileContent) {
    // 🛡️ FASE 0: Normalización inicial del texto
    console.log('🔍 Iniciando análisis y corrección automática de CSV...');
    
    // Eliminar BOM (Byte Order Mark) si existe
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
      console.log('✅ BOM eliminado');
    }
    
    // Reemplazar comillas tipográficas por comillas rectas
    fileContent = fileContent.replace(/[""]/g, '"').replace(/['']/g, "'");
    
    let lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      console.error('❌ Archivo CSV vacío');
      return fileContent;
    }
    
    // 🧩 FASE 1: Análisis de condiciones de activación
    const firstLine = lines[0];
    const shouldCorrect = this.shouldCorrectCSV(firstLine, fileContent);
    
    if (!shouldCorrect.needsCorrection) {
      console.log('✅ CSV con formato correcto, no requiere corrección');
      return fileContent;
    }
    
    console.log(`⚠️  CSV requiere corrección: ${shouldCorrect.reasons.join(', ')}`);
    
    // 🔧 FASE 2: Corrección de encabezados
    lines[0] = this.correctCSVLine(lines[0], true);
    
    // 🔧 FASE 3: Corrección de filas de datos
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        lines[i] = this.correctCSVLine(lines[i], false);
      }
    }
    
    const correctedContent = lines.join('\n');
    
    // 🔍 FASE 4: Validación post-corrección
    const validation = this.validateCorrectedCSV(correctedContent);
    if (!validation.valid) {
      console.error('❌ CSV no pudo ser reparado correctamente:', validation.error);
      console.error('📋 Se requiere revisión manual');
      // Retornar el contenido corregido de todos modos, el parser decidirá
    } else {
      console.log(`✅ CSV corregido exitosamente: ${validation.columnCount} columnas detectadas`);
    }
    
    return correctedContent;
  }
  
  // 🔍 Determinar si el CSV necesita corrección
  shouldCorrectCSV(firstLine, fullContent) {
    const reasons = [];
    let needsCorrection = false;
    
    // Condición 1: Toda la primera línea está entre comillas
    if (firstLine.startsWith('"') && firstLine.endsWith('"')) {
      const innerContent = firstLine.slice(1, -1);
      if (innerContent.includes(',')) {
        reasons.push('Encabezados encerrados en comillas');
        needsCorrection = true;
      }
    }
    
    // Condición 2: Solo una columna detectada (parsing rápido)
    const quickParse = firstLine.split(',');
    if (quickParse.length === 1 && firstLine.includes(',')) {
      reasons.push('Una sola columna detectada con comas internas');
      needsCorrection = true;
    }
    
    // Condición 3: Número impar de comillas
    const quoteCount = (firstLine.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      reasons.push('Comillas desbalanceadas');
      needsCorrection = true;
    }
    
    // Condición 4: Detectar si parece ser el formato problemático conocido
    if (firstLine.includes('Entidad') && firstLine.includes('Objeto') && 
        firstLine.includes('Cuantía') && quoteCount > 0) {
      const tempParse = Papa.parse(firstLine, { header: false }).data[0];
      if (tempParse && tempParse.length < 5) {
        reasons.push('Formato SECOP II mal delimitado');
        needsCorrection = true;
      }
    }
    
    return { needsCorrection, reasons };
  }
  
  // 🔧 Corregir una línea individual del CSV
  correctCSVLine(line, isHeader) {
    let corrected = line.trim();
    
    // Paso 1: Balancear comillas si están desbalanceadas
    const quoteCount = (corrected.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      corrected += '"';
      console.log(`  🔧 Comilla agregada al ${isHeader ? 'encabezado' : 'final de línea'} para balancear`);
    }
    
    // Paso 2: Si toda la línea está entre comillas externas, removerlas
    if (corrected.startsWith('"') && corrected.endsWith('"')) {
      const inner = corrected.slice(1, -1);
      
      // Verificar si es un caso de "toda la línea envuelta"
      // Solo remover si no hay comillas escapadas correctamente
      const hasProperlyEscapedQuotes = inner.includes('""');
      
      if (!hasProperlyEscapedQuotes || inner.split(',').length > 10) {
        corrected = inner;
        console.log(`  ✅ Comillas externas removidas ${isHeader ? 'del encabezado' : ''}`);
      }
    }
    
    // Paso 3: Reemplazar comillas dobles escapadas por comillas simples
    corrected = corrected.replace(/""/g, '"');
    
    // Paso 4: Normalizar encabezados si es la primera línea
    if (isHeader) {
      corrected = this.normalizeHeaders(corrected);
    }
    
    return corrected;
  }
  
  // 📋 Validar CSV después de la corrección
  validateCorrectedCSV(content) {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      return { valid: false, error: 'CSV vacío después de corrección' };
    }
    
    // Parsear solo la primera línea para contar columnas
    const headerParse = Papa.parse(lines[0], { 
      header: false,
      delimiter: ',',
      quoteChar: '"'
    });
    
    const columnCount = headerParse.data[0]?.length || 0;
    
    // Validar que tengamos un número razonable de columnas
    if (columnCount < 3) {
      return { 
        valid: false, 
        error: `Solo ${columnCount} columnas detectadas, se esperaban al menos 3`,
        columnCount 
      };
    }
    
    // Idealmente deberíamos tener 13 columnas (formato SECOP II completo)
    // Pero aceptamos entre 3 y 20 como válido
    if (columnCount > 20) {
      return { 
        valid: false, 
        error: `Demasiadas columnas (${columnCount}), posible error en delimitadores`,
        columnCount 
      };
    }
    
    return { valid: true, columnCount };
  }

  // 🔧 Normalizar nombres de encabezados para que coincidan con formato esperado
  normalizeHeaders(headerLine) {
    // Si la línea está vacía, devolver sin cambios
    if (!headerLine || !headerLine.trim()) {
      return headerLine;
    }

    // Mapeo de variantes de nombres a nombres estándar
    const headerMapping = {
      // Variantes de "Entidad"
      'entidad': 'Entidad',
      'ENTIDAD': 'Entidad',
      'Entidad Contratante': 'Entidad',
      'Nombre Entidad': 'Entidad',
      
      // Variantes de "Objeto"
      'objeto': 'Objeto',
      'OBJETO': 'Objeto',
      'Objeto del Contrato': 'Objeto',
      'Descripción': 'Objeto',
      'Descripcion': 'Objeto',
      
      // Variantes de "Cuantía"
      'cuantia': 'Cuantía',
      'CUANTIA': 'Cuantía',
      'cuantía': 'Cuantía',
      'CUANTÍA': 'Cuantía',
      'Valor': 'Cuantía',
      'Valor Contrato': 'Cuantía',
      'Presupuesto': 'Cuantía',
      
      // Variantes de "Modalidad"
      'modalidad': 'Modalidad',
      'MODALIDAD': 'Modalidad',
      'Tipo Modalidad': 'Modalidad',
      'Tipo de Contrato': 'Modalidad',
      
      // Variantes de "Número"
      'numero': 'Número',
      'NUMERO': 'Número',
      'número': 'Número',
      'NÚMERO': 'Número',
      'Número Proceso': 'Número',
      'No. Proceso': 'Número',
      'Proceso': 'Número',
      
      // Variantes de "Estado"
      'estado': 'Estado',
      'ESTADO': 'Estado',
      'Estado Proceso': 'Estado',
      'Etapa': 'Estado',
      
      // Variantes de "F. Publicación"
      'F. Publicacion': 'F. Publicación',
      'F. Publicación': 'F. Publicación',
      'f. publicacion': 'F. Publicación',
      'f. publicación': 'F. Publicación',
      'Fecha Publicacion': 'F. Publicación',
      'Fecha Publicación': 'F. Publicación',
      'Fecha': 'F. Publicación',
      
      // Variantes de "Ubicación"
      'ubicacion': 'Ubicación',
      'UBICACION': 'Ubicación',
      'ubicación': 'Ubicación',
      'UBICACIÓN': 'Ubicación',
      'Departamento': 'Ubicación',
      'Localización': 'Ubicación',
      'Localizacion': 'Ubicación',
      
      // Variantes de "Actividad Económica"
      'Actividad Economica': 'Actividad Económica',
      'actividad economica': 'Actividad Económica',
      'ACTIVIDAD ECONOMICA': 'Actividad Económica',
      'actividad económica': 'Actividad Económica',
      'ACTIVIDAD ECONÓMICA': 'Actividad Económica',
      'Sector': 'Actividad Económica',
      'Categoría': 'Actividad Económica',
      'Categoria': 'Actividad Económica',
      
      // Variantes de "Códigos UNSPSC"
      'Codigos UNSPSC': 'Códigos UNSPSC',
      'codigos unspsc': 'Códigos UNSPSC',
      'CODIGOS UNSPSC': 'Códigos UNSPSC',
      'códigos unspsc': 'Códigos UNSPSC',
      'CÓDIGOS UNSPSC': 'Códigos UNSPSC',
      'UNSPSC': 'Códigos UNSPSC',
      'Código UNSPSC': 'Códigos UNSPSC',
      'Codigo UNSPSC': 'Códigos UNSPSC',
      
      // Variantes de "Enlace"
      'enlace': 'Enlace',
      'ENLACE': 'Enlace',
      'Link': 'Enlace',
      'URL': 'Enlace',
      'Vínculo': 'Enlace',
      'Vinculo': 'Enlace',
      
      // Variantes de "Portal de origen"
      'Portal de Origen': 'Portal de origen',
      'portal de origen': 'Portal de origen',
      'PORTAL DE ORIGEN': 'Portal de origen',
      'Portal': 'Portal de origen',
      'Fuente': 'Portal de origen',
      
      // Variantes de "Contratista(s)"
      'Contratista': 'Contratista(s)',
      'contratista': 'Contratista(s)',
      'CONTRATISTA': 'Contratista(s)',
      'Contratistas': 'Contratista(s)',
      'contratistas': 'Contratista(s)',
      'Adjudicatario': 'Contratista(s)',
    };

    try {
      // Dividir la línea en campos
      const fields = this.parseHeaderLine(headerLine);
      
      // Normalizar cada campo
      const normalizedFields = fields.map(field => {
        const trimmed = field.trim();
        // Buscar en el mapeo
        if (headerMapping[trimmed]) {
          console.log(`📝 Normalizando campo: "${trimmed}" → "${headerMapping[trimmed]}"`);
          return headerMapping[trimmed];
        }
        return trimmed;
      });
      
      // Reconstruir la línea
      return normalizedFields.map(field => {
        // Si el campo tiene espacios o caracteres especiales, agregar comillas
        if (field.includes(' ') || field.includes('.') || field.includes('(')) {
          return `"${field}"`;
        }
        return field;
      }).join(',');
    } catch (error) {
      console.error('Error normalizando headers:', error);
      return headerLine; // Devolver sin cambios si hay error
    }
  }

  // Parsear línea de encabezados considerando comillas
  parseHeaderLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.replace(/^"|"$/g, '').trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Agregar el último campo
    if (current) {
      fields.push(current.replace(/^"|"$/g, '').trim());
    }
    
    return fields;
  }

  // Parsear archivo Excel
  async parseExcel(filePath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      const worksheet = workbook.worksheets[0]; // Primera hoja
      
      if (!worksheet) {
        throw new Error('El archivo Excel está vacío');
      }

      let headers = [];
      let data = [];

      // 🔍 PASO 1: Obtener headers de la primera fila
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        headers.push(cell.value ? cell.value.toString() : '');
      });

      // 🧩 PASO 2: Detectar si todas las columnas están colapsadas en una sola
      const isCollapsed = headers.length === 1 && headers[0].includes(',');
      
      if (isCollapsed) {
        console.log('⚠️  Excel con estructura colapsada detectado (CSV dentro de Excel)');
        console.log('🔧 Aplicando corrección automática...');
        
        // Extraer todas las filas como texto CSV
        const csvLines = [];
        worksheet.eachRow((row) => {
          const firstCell = row.getCell(1).value;
          if (firstCell) {
            csvLines.push(firstCell.toString());
          }
        });
        
        // Parsear como CSV usando PapaParse
        const csvText = csvLines.join('\n');
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          delimiter: ',',
          quoteChar: '"',
          escapeChar: '"',
          trimHeaders: true,
          trimFields: true,
        });
        
        headers = parsed.meta.fields || [];
        data = parsed.data || [];
        
        console.log(`✅ Estructura corregida: ${headers.length} columnas, ${data.length} registros`);
        console.log(`📋 Columnas detectadas: ${headers.join(', ')}`);
        
      } else {
        // 📊 PASO 3: Procesamiento normal (Excel bien estructurado)
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row

          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.value;
            }
          });

          // Solo agregar si tiene al menos un valor
          if (Object.values(rowData).some(v => v !== null && v !== undefined && v !== '')) {
            data.push(rowData);
          }
        });
        
        console.log(`✅ Excel parseado: ${headers.length} columnas, ${data.length} registros`);
        console.log(`📋 Columnas: ${headers.join(', ')}`);
      }

      // 🧹 PASO 4: Limpiar columnas vacías (Unnamed: X)
      const cleanHeaders = headers.filter(h => h && !h.startsWith('Unnamed:'));
      const cleanData = data.map(row => {
        const cleanRow = {};
        cleanHeaders.forEach(header => {
          if (row[header] !== undefined) {
            cleanRow[header] = row[header];
          }
        });
        return cleanRow;
      });

      return {
        data: cleanData,
        headers: cleanHeaders,
        rowCount: cleanData.length,
      };
    } catch (error) {
      throw new Error(`Error parseando Excel: ${error.message}`);
    }
  }

  // Parsear archivo según tipo
  async parseFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    let result;
    
    // 📄 PASO 1: Parsear según tipo de archivo
    if (ext === '.csv') {
      result = await this.parseCSV(filePath);
    } else if (ext === '.xlsx' || ext === '.xls') {
      result = await this.parseExcel(filePath);
    } else {
      throw new Error('Tipo de archivo no soportado');
    }

    // 🛡️ PASO 2: Validar datos
    console.log('\n🛡️  Iniciando validación y corrección automática...');
    const validationReport = await dataValidatorService.validateFile(
      result.data,
      result.headers
    );

    // 🔧 PASO 3: Aplicar correcciones automáticas
    const corrected = await dataValidatorService.autoCorrect(
      result.data,
      result.headers
    );

    // 📊 PASO 4: Generar reporte
    const report = dataValidatorService.generateReport(
      validationReport,
      corrected.corrections
    );

    // ✅ PASO 5: Retornar datos corregidos
    return {
      data: corrected.data,
      headers: corrected.headers,
      rowCount: corrected.data.length,
      validationReport: report
    };
  }

  // Limpiar archivos temporales
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
    }
  }
}

export default new FileParserService();


