import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import importService from '../services/importService';
import odooService from '../services/odooService';
import LoadingSpinner from '../components/LoadingSpinner';
import DetalleContratoModal from '../components/DetalleContratoModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Import = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Importing, 4: Results
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [hasOdooConfig, setHasOdooConfig] = useState(true);
  const [extractingDeadlines, setExtractingDeadlines] = useState(false);
  const [deadlineResults, setDeadlineResults] = useState(null);
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);

  // Verificar configuración de Odoo al cargar
  useState(() => {
    const checkOdooConfig = async () => {
      try {
        await odooService.getCredentials();
        setHasOdooConfig(true);
      } catch (error) {
        setHasOdooConfig(false);
      }
    };
    checkOdooConfig();
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);

    try {
      const response = await importService.uploadFile(selectedFile, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted);
      });

      if (response.success) {
        setFileData(response.data);
        setStep(2);
        toast.success('Archivo cargado exitosamente');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar archivo');
      setFile(null);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  const handleImport = async () => {
    setImporting(true);
    setStep(3);

    try {
      const response = await importService.executeImport({
        filePath: fileData.filePath,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileType: fileData.fileType,
      });

      if (response.success) {
        setImportResults(response.data);
        setStep(4);
        toast.success('Importación completada');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error en la importación');
      setStep(2);
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setStep(1);
    setFile(null);
    setFileData(null);
    setImportResults(null);
    setDeadlineResults(null);
  };

  const handleExtractDeadlines = async () => {
    if (!fileData || !fileData.filePath) {
      toast.error('No hay archivo cargado');
      return;
    }

    setExtractingDeadlines(true);

    try {
      const response = await importService.extractDeadlines(fileData.filePath);
      
      if (response.success) {
        // El backend devuelve {success, message, data: {summary, details, deadlinesByUrl}}
        const extractionData = response.data || {};
        setDeadlineResults(extractionData);
        
        // Validar que summary exista antes de usarlo
        if (extractionData.summary) {
          const total = extractionData.summary.total || 0;
          const ok = extractionData.summary.ok || 0;
          toast.success(`Fechas extraídas: ${ok}/${total} exitosas`);
        } else {
          toast.success('Extracción completada');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error extrayendo fechas');
    } finally {
      setExtractingDeadlines(false);
    }
  };

  if (!hasOdooConfig) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Configuración Requerida</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Debes configurar tus credenciales de Odoo antes de poder importar archivos.
        </p>
        <button
          onClick={() => navigate('/odoo-config')}
          className="btn-primary"
        >
          Ir a Configuración
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Importar Datos</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Carga tu archivo CSV/Excel de SECOP II para importar a Odoo
        </p>
      </div>

      {/* Steps indicator */}
      <div className="overflow-x-auto -mx-4 px-4 py-2">
        <div className="flex items-center justify-start space-x-2 sm:space-x-3 min-w-max">
        {[
          { num: 1, label: 'Cargar' },
          { num: 2, label: 'Vista Previa' },
          { num: 3, label: 'Importando' },
          { num: 4, label: 'Resultados' },
        ].map((s, index) => (
          <div key={s.num} className="flex items-center">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base md:text-lg ${
                  step >= s.num
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {s.num}
              </div>
              <span
                className={`text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${
                  step >= s.num ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < 3 && (
              <div className={`w-4 sm:w-6 md:w-8 h-1 mx-1 sm:mx-2 md:mx-3 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card p-3 sm:p-4 md:p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 lg:p-12 text-center cursor-pointer transition-colors min-h-[200px] sm:min-h-[250px] md:min-h-[300px] flex items-center justify-center ${
              isDragActive
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            }`}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <div className="w-full space-y-2 sm:space-y-3 md:space-y-4 px-2">
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto text-gray-400" />
                {isDragActive ? (
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-primary-600 px-2">
                    Suelta el archivo aquí...
                  </p>
                ) : (
                  <>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-tight px-2">
                      Arrastra y suelta tu archivo aquí
                    </p>
                    <p className="text-sm sm:text-base md:text-lg text-gray-500 px-2">
                      o haz clic para seleccionar
                    </p>
                    <p className="text-xs sm:text-sm md:text-base text-gray-400 px-2 leading-relaxed">
                      Formatos soportados: CSV, XLSX, XLS (Máx. 10MB)
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && fileData && (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* File info */}
          <div className="card">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <FileSpreadsheet className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">{fileData.fileName}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {fileData.rowCount} filas • {(fileData.fileSize / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <div className="card bg-blue-50 dark:bg-blue-900/20 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Registros</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{fileData.stats.totalRecords}</p>
            </div>
            <div className="card bg-green-50 dark:bg-green-900/20 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Valor Total</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                ${fileData.stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="card bg-purple-50 dark:bg-purple-900/20 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Con Email</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">
                {fileData.stats.recordsWithEmail}
              </p>
            </div>
          </div>

          {/* Preview table - TODOS LOS CAMPOS */}
          <div className="card">
            <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4">
              📋 Vista Previa Completa ({fileData.preview.length} filas - {fileData.headers.length} columnas)
            </h3>
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5 lg:-mx-6">
              <div className="inline-block min-w-full align-middle px-3 sm:px-4 md:px-5 lg:px-6">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-2 py-1.5 sm:py-2 text-left font-medium border-b sticky left-0 bg-gray-100 dark:bg-gray-700 z-10 text-xs">#</th>
                    {fileData.headers.map((header, index) => (
                      <th key={index} className="px-2 py-1.5 sm:py-2 text-left font-medium whitespace-nowrap border-b text-xs">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fileData.preview.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-2 py-1.5 sm:py-2 font-medium sticky left-0 bg-white dark:bg-gray-900 z-10 border-r text-xs">{rowIndex + 1}</td>
                      {fileData.headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-2 py-1.5 sm:py-2 max-w-[120px] sm:max-w-[150px] md:max-w-xs truncate text-xs" title={row[header]}>
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
              💡 Desliza horizontalmente para ver todos los campos
            </p>
          </div>

          {/* Mapeo de Campos */}
          <div className="card">
            <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4">🔄 Transformación de campos en Odoo</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-xs sm:text-sm text-primary-600">📊 Campos CSV</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm">
                    <p className="font-medium mb-1"><strong>Modalidad</strong> + <strong>Número</strong> → <span className="text-green-600">Nombre del Lead</span></p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Ej: "Selección Abreviada - SASI-029-SG-2025"</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm">
                    <p className="font-medium mb-1"><strong>Entidad</strong> → <span className="text-green-600">Cliente/Partner</span></p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Se busca o crea automáticamente</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm">
                    <p className="font-medium mb-1"><strong>Objeto</strong> → <span className="text-green-600">Descripción del Lead</span></p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Incluye todos los detalles formateados</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm">
                    <p className="font-medium mb-1"><strong>Cuantía</strong> → <span className="text-green-600">Ingreso Esperado</span></p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Valor numérico del contrato</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-xs sm:text-sm text-primary-600">🏷️ Etiquetas y Extras</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm">
                    <p className="font-medium mb-1"><strong>Actividad Económica</strong> → <span className="text-purple-600">Tag/Etiqueta</span></p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Se crea automáticamente como etiqueta</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm">
                    <p className="font-medium mb-1"><strong>TECNOPHONE</strong> → <span className="text-purple-600">Tag Empresa</span></p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Asignado a todos los leads</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm">
                    <p className="font-medium mb-1"><strong>Ubicación</strong> → <span className="text-orange-600">Ciudad</span></p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Ej: "Bogotá D.C."</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm">
                    <p className="font-medium mb-1"><strong>Estado</strong> → <span className="text-orange-600">Etapa del Pipeline</span></p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Nuevo/En Proceso según estado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Extracción de Fechas de Cierre */}
          {fileData.headers.includes('Enlace') && (
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-2 flex items-center">
                    <span className="text-xl sm:text-2xl mr-2">📅</span>
                    <span className="text-sm sm:text-base">Extracción de Fechas de Cierre</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                    Este archivo contiene enlaces a licitaciones. Puedes extraer automáticamente las fechas de presentación de ofertas visitando cada URL.
                  </p>
                  <button
                    onClick={handleExtractDeadlines}
                    disabled={extractingDeadlines}
                    className="btn-primary flex items-center space-x-2 w-full justify-center text-sm sm:text-base"
                  >
                    {extractingDeadlines ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="text-xs sm:text-sm">Extrayendo fechas...</span>
                      </>
                    ) : (
                      <>
                        <span>🔍</span>
                        <span className="text-xs sm:text-sm">Extraer Fechas de {fileData.rowCount} Enlaces</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Resultados de extracción */}
              {deadlineResults && deadlineResults.summary && (
                <div className="mt-4 sm:mt-6 space-y-4">
                  {/* Resumen */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Exitosos</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-700">{deadlineResults.summary.ok || 0}</p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 rounded text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">No encontrados</p>
                      <p className="text-xl sm:text-2xl font-bold text-yellow-700">{deadlineResults.summary.not_found || 0}</p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Errores</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-700">
                        {(deadlineResults.summary.invalid_url || 0) + (deadlineResults.summary.parse_error || 0) + (deadlineResults.summary.timeout || 0) + (deadlineResults.summary.navigation_error || 0)}
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-2xl font-bold text-blue-700">{deadlineResults.summary.total}</p>
                    </div>
                  </div>

                  {/* Tabla de resultados */}
                  <div className="overflow-x-auto max-h-96 overflow-y-auto -mx-2 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-2 sm:px-0">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-2 sm:px-3 py-2 text-left sticky left-0 bg-gray-200 dark:bg-gray-700 z-10">#</th>
                          <th className="px-2 sm:px-3 py-2 text-left">Enlace</th>
                          <th className="px-2 sm:px-3 py-2 text-left whitespace-nowrap">Fecha</th>
                          <th className="px-2 sm:px-3 py-2 text-left">Estado</th>
                          <th className="px-2 sm:px-3 py-2 text-center">Ver</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deadlineResults.results.map((result, idx) => (
                          <tr key={idx} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-2 sm:px-3 py-2 sticky left-0 bg-white dark:bg-gray-900 z-10">{idx + 1}</td>
                            <td className="px-2 sm:px-3 py-2 max-w-[150px] sm:max-w-xs truncate">
                              <a href={result.enlace} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                {result.enlace}
                              </a>
                            </td>
                            <td className="px-2 sm:px-3 py-2 font-mono text-xs font-semibold whitespace-nowrap">
                              {result.normalized || '-'}
                            </td>
                            <td className="px-2 sm:px-3 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                result.status === 'ok' ? 'bg-green-100 text-green-800' :
                                result.status === 'not_found' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`} title={result.meta?.reason}>
                                {result.status}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 py-2 text-center">
                              {result.datosCompletos && (
                                <button
                                  onClick={() => {
                                    setSelectedContrato(result.datosCompletos);
                                    setShowDetalleModal(true);
                                  }}
                                  className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Ver detalles completos del contrato"
                                >
                                  <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    ✅ Las fechas extraídas se aplicarán automáticamente al campo "Cierre esperado" en Odoo durante la importación.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button onClick={resetImport} className="btn-secondary flex-1 text-sm sm:text-base py-3 sm:py-2">
              Cancelar
            </button>
            <button onClick={handleImport} className="btn-primary flex-1 text-sm sm:text-base py-3 sm:py-2">
              Iniciar Importación
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 3 && (
        <div className="card text-center py-8 sm:py-12">
          <LoadingSpinner size="lg" />
          <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6 mb-2">Importando datos...</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            Por favor espera mientras procesamos tus datos
          </p>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && importResults && (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="card bg-blue-50 dark:bg-blue-900/20 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{importResults.totalRecords}</p>
            </div>
            <div className="card bg-green-50 dark:bg-green-900/20 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Exitosos</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{importResults.successful}</p>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mt-1 sm:mt-2" />
            </div>
            <div className="card bg-yellow-50 dark:bg-yellow-900/20 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Duplicados</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{importResults.duplicates}</p>
            </div>
            <div className="card bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Fallidos</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{importResults.failed}</p>
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mx-auto mt-1 sm:mt-2" />
            </div>
          </div>

          {/* Success rate */}
          <div className="card">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Resumen de Importación</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Tasa de Éxito</span>
                <span className="font-bold text-xl sm:text-2xl text-green-600">{importResults.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                <div
                  className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${importResults.successRate}%` }}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 gap-1 sm:gap-0">
                <span>Duración: {importResults.duration}s</span>
                <span className="truncate">ID: {importResults.importId}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button onClick={resetImport} className="btn-secondary flex-1 text-sm sm:text-base py-3 sm:py-2">
              Nueva Importación
            </button>
            <button
              onClick={() => navigate('/history')}
              className="btn-primary flex-1 text-sm sm:text-base py-3 sm:py-2"
            >
              Ver Historial
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles del contrato */}
      <DetalleContratoModal
        isOpen={showDetalleModal}
        onClose={() => {
          setShowDetalleModal(false);
          setSelectedContrato(null);
        }}
        datos={selectedContrato}
      />
    </div>
  );
};

export default Import;


