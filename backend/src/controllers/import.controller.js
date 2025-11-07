import path from 'path';
import fs from 'fs';
import ImportHistory from '../models/ImportHistory.model.js';
import OdooCredentials from '../models/OdooCredentials.model.js';
import fileParserService from '../services/fileParser.service.js';
import dataTransformerService from '../services/dataTransformer.service.js';
import OdooService from '../services/odoo.service.js';
import scraperService from '../services/scraper.service.js';

// Subir y parsear archivo
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo',
      });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);

    // Parsear archivo con corrección automática
    const parsed = await fileParserService.parseFile(filePath);

    // Validar estructura
    const validation = dataTransformerService.validateStructure(parsed.headers);

    if (!validation.valid) {
      // Limpiar archivo
      fileParserService.cleanupFile(filePath);
      
      return res.status(400).json({
        success: false,
        message: validation.message,
        missingFields: validation.missingFields,
        headers: parsed.headers, // Incluir headers detectados para debugging
      });
    }

    // Generar estadísticas
    const stats = dataTransformerService.generateStats(parsed.data);

    // Mensaje informativo si se hicieron correcciones
    let message = 'Archivo parseado exitosamente';
    const warnings = [];
    
    // Detectar si el archivo fue corregido automáticamente
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const firstLine = fileContent.split('\n')[0];
    
    if (firstLine.trim().startsWith('"') && firstLine.trim().endsWith('"')) {
      warnings.push('El archivo tenía un formato no estándar y fue corregido automáticamente');
    }

    res.json({
      success: true,
      message,
      warnings: warnings.length > 0 ? warnings : undefined,
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType,
        filePath,
        headers: parsed.headers,
        rowCount: parsed.rowCount,
        preview: parsed.data.slice(0, 10), // Primeras 10 filas
        stats,
        formatCorrected: warnings.length > 0, // Flag indicando si se corrigió
      },
    });
  } catch (error) {
    console.error('Error procesando archivo:', error);
    
    // Limpiar archivo en caso de error
    if (req.file) {
      fileParserService.cleanupFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error al procesar archivo',
      error: error.message,
    });
  }
};

// Ejecutar importación
export const executeImport = async (req, res) => {
  try {
    const { filePath, fileName, fileSize, fileType } = req.body;
    const userId = req.user._id;

    // Verificar credenciales de Odoo
    const credentials = await OdooCredentials.findOne({ userId });
    
    if (!credentials) {
      return res.status(404).json({
        success: false,
        message: 'No hay credenciales de Odoo configuradas',
      });
    }

    // Parsear archivo
    const parsed = await fileParserService.parseFile(filePath);

    // Transformar datos (pasando filePath para obtener fechas extraídas)
    const transformedData = dataTransformerService.transformData(parsed.data, filePath);

    // Crear registro de historial
    const importRecord = await ImportHistory.create({
      userId,
      fileName,
      fileSize,
      fileType,
      totalRecords: transformedData.length,
      status: 'processing',
      startTime: new Date(),
      metadata: {
        odooUrl: credentials.url,
        odooDatabase: credentials.database,
      },
    });

    // Iniciar importación a Odoo
    try {
      const odooService = new OdooService(credentials);
      console.log(`\n🚀 Iniciando importación de ${transformedData.length} registros a Odoo...`);
      const results = await odooService.createLeads(transformedData);

      console.log('\n📊 RESULTADOS DE IMPORTACIÓN A ODOO:');
      console.log('✅ Exitosos:', results.successful.length);
      console.log('🔄 Duplicados:', results.duplicates.length);
      console.log('❌ Fallidos:', results.failed.length);
      console.log('👥 Partners encontrados:', results.partnersFound || 0);
      console.log('🆕 Partners creados:', results.partnersCreated || 0);
      
      if (results.successful.length > 0) {
        console.log('\n✅ LEADS CREADOS EXITOSAMENTE:');
        results.successful.forEach((s, i) => {
          console.log(`  ${i + 1}. ID: ${s.id} - ${s.data?.name || 'Sin nombre'}`);
        });
      }
      
      if (results.failed.length > 0) {
        console.log('\n❌ LEADS FALLIDOS:');
        results.failed.forEach((f, i) => {
          console.log(`  ${i + 1}. Fila ${f.row}: ${f.error}`);
        });
      }

      // Actualizar historial
      importRecord.status = 'completed';
      importRecord.successfulRecords = results.successful.length;
      importRecord.duplicateRecords = results.duplicates.length;
      importRecord.failedRecords = results.failed.length;
      importRecord.endTime = new Date();
      importRecord.duration = Math.floor((importRecord.endTime - importRecord.startTime) / 1000);
      
      // Guardar duplicados
      importRecord.duplicates = results.duplicates.map(d => ({
        row: d.row,
        reason: d.reason,
        existingId: d.existingId?.toString(),
      }));

      // Guardar errores
      importRecord.importErrors = results.failed.map(f => ({
        row: f.row,
        message: f.error,
        timestamp: new Date(),
      }));

      // Generar resumen
      const stats = dataTransformerService.generateStats(parsed.data);
      importRecord.summary = {
        totalValue: stats.totalValue,
        averageValue: stats.averageValue,
        categoryCounts: stats.typeCounts,
        partnersFound: results.partnersFound || 0,
        partnersCreated: results.partnersCreated || 0,
      };

      await importRecord.save();

      // Limpiar archivo
      fileParserService.cleanupFile(filePath);

      res.json({
        success: true,
        message: 'Importación completada',
        data: {
          importId: importRecord._id,
          totalRecords: importRecord.totalRecords,
          successful: importRecord.successfulRecords,
          duplicates: importRecord.duplicateRecords,
          failed: importRecord.failedRecords,
          duration: importRecord.duration,
          successRate: importRecord.successRate,
        },
      });
    } catch (odooError) {
      // Error en Odoo
      importRecord.status = 'failed';
      importRecord.endTime = new Date();
      importRecord.importErrors.push({
        message: odooError.message,
        timestamp: new Date(),
      });
      await importRecord.save();

      // Limpiar archivo
      fileParserService.cleanupFile(filePath);

      throw odooError;
    }
  } catch (error) {
    console.error('Error en importación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar importación',
      error: error.message,
    });
  }
};

// Obtener historial de importaciones
export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const imports = await ImportHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ImportHistory.countDocuments(query);

    res.json({
      success: true,
      data: {
        imports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message,
    });
  }
};

// Obtener detalles de una importación
export const getImportDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const importRecord = await ImportHistory.findOne({ _id: id, userId });

    if (!importRecord) {
      return res.status(404).json({
        success: false,
        message: 'Importación no encontrada',
      });
    }

    res.json({
      success: true,
      data: importRecord,
    });
  } catch (error) {
    console.error('Error obteniendo detalles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles',
      error: error.message,
    });
  }
};

// Obtener estadísticas generales
export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await ImportHistory.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalImports: { $sum: 1 },
          totalRecords: { $sum: '$totalRecords' },
          totalSuccessful: { $sum: '$successfulRecords' },
          totalDuplicates: { $sum: '$duplicateRecords' },
          totalFailed: { $sum: '$failedRecords' },
          avgDuration: { $avg: '$duration' },
        },
      },
    ]);

    const recentImports = await ImportHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fileName status totalRecords successfulRecords createdAt');

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalImports: 0,
          totalRecords: 0,
          totalSuccessful: 0,
          totalDuplicates: 0,
          totalFailed: 0,
          avgDuration: 0,
        },
        recentImports,
      },
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
};

// 📅 Extraer fechas de cierre desde enlaces
export const extractDeadlines = async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el path del archivo',
      });
    }

    // Parsear el archivo para obtener las filas
    const parsed = await fileParserService.parseFile(filePath);

    // Verificar que existe la columna "Enlace"
    if (!parsed.headers.includes('Enlace')) {
      return res.status(400).json({
        success: false,
        message: 'El archivo no contiene la columna "Enlace"',
        headers: parsed.headers,
      });
    }

    console.log(`\n🔗 Iniciando extracción de fechas para ${parsed.data.length} enlaces...`);

    // Extraer fechas de todos los enlaces
    const extraction = await scraperService.extractDeadlineDatesFromRows(parsed.data);

    // 📝 Guardar fechas en un mapa por enlace (en memoria del servidor)
    const deadlineMap = {};
    
    // Validar que extraction.results exista y sea un array
    if (extraction && Array.isArray(extraction.results)) {
      extraction.results.forEach(result => {
        if (result.enlace && result.normalized) {
          deadlineMap[result.enlace] = result.normalized;
        }
      });
    } else {
      console.warn(`⚠️ No se obtuvieron resultados de extracción válidos`);
    }

    // Guardar el mapa en el objeto global para que esté disponible durante la importación
    if (!global.deadlineMaps) {
      global.deadlineMaps = {};
    }
    global.deadlineMaps[filePath] = deadlineMap;

    console.log(`✅ Fechas extraídas y almacenadas en memoria`);
    console.log(`� Total de fechas guardadas: ${Object.keys(deadlineMap).length}`);
    console.log(`� Fechas por enlace:`, JSON.stringify(deadlineMap, null, 2));

    res.json({
      success: true,
      message: 'Extracción de fechas completada. Las fechas se usarán automáticamente al importar.',
      data: {
        results: extraction.results,
        summary: extraction.summary,
        totalDeadlinesSaved: Object.keys(deadlineMap).length,
      },
    });

  } catch (error) {
    console.error('Error extrayendo fechas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al extraer fechas de cierre',
      error: error.message,
    });
  }
};

