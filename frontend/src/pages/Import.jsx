import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Eye, ChevronDown } from 'lucide-react';
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
  const [expandedPreviewRow, setExpandedPreviewRow] = useState(null);
  const [expandedDeadlineRow, setExpandedDeadlineRow] = useState(null);

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
        setExpandedPreviewRow(null);
        setExpandedDeadlineRow(null);
        setDeadlineResults(null);
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
    setExpandedPreviewRow(null);
    setExpandedDeadlineRow(null);
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
        setExpandedDeadlineRow(null);
        
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

  const togglePreviewRow = (rowIndex) => {
    setExpandedPreviewRow((prev) => (prev === rowIndex ? null : rowIndex));
  };

  const toggleDeadlineRow = (rowIndex) => {
    setExpandedDeadlineRow((prev) => (prev === rowIndex ? null : rowIndex));
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
  <div className="max-w-7xl mx-auto w-full space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Importar Datos</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Carga tu archivo CSV/Excel de SECOP II para importar a Odoo
        </p>
      </div>

      {/* Steps indicator */}
      <div className="py-2">
        <div className="flex flex-wrap items-center justify-center lg:justify-between gap-4 sm:gap-6 md:gap-8 xl:gap-10 w-full">
          {[
            { num: 1, label: 'Cargar' },
            { num: 2, label: 'Vista Previa' },
            { num: 3, label: 'Importando' },
            { num: 4, label: 'Resultados' },
          ].map((s, index) => (
            <div key={s.num} className="flex items-center gap-3 lg:gap-4 lg:flex-1 lg:min-w-[220px]">
              <div className="flex flex-col items-center min-w-[64px]">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s.num
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`mt-2 text-xs sm:text-sm font-medium ${
                    step >= s.num ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < 3 && (
                <div
                  className={`hidden sm:block h-1 sm:w-16 md:w-20 lg:w-full lg:h-1.5 transition-colors ${
                    step > s.num ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card p-3 sm:p-4 md:p-6 lg:p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 lg:p-12 xl:p-14 text-center cursor-pointer transition-colors min-h-[200px] sm:min-h-[250px] md:min-h-[300px] flex items-center justify-center ${
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
          <div className="card lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="card bg-blue-50 dark:bg-blue-900/20 text-center p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Total Registros</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 lg:text-4xl">{fileData.stats.totalRecords}</p>
            </div>
            <div className="card bg-green-50 dark:bg-green-900/20 text-center p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Valor Total</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 lg:text-4xl">
                ${fileData.stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="card bg-purple-50 dark:bg-purple-900/20 text-center p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Con Email</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 lg:text-4xl">
                {fileData.stats.recordsWithEmail}
              </p>
            </div>
          </div>

          {/* Preview table - TODOS LOS CAMPOS */}
          <div className="card lg:p-6">
            <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4">
              📋 Vista Previa Completa ({fileData.preview.length} filas - {fileData.headers.length} columnas)
            </h3>

            {/* Mobile stacked preview */}
            <div className="sm:hidden space-y-3">
              {fileData.preview.map((row, rowIndex) => {
                const primaryField = fileData.headers.find((header) => {
                  const value = row[header];
                  return value !== null && value !== undefined && String(value).trim().length > 0;
                });
                const primaryValue = primaryField ? row[primaryField] : null;
                const isExpanded = expandedPreviewRow === rowIndex;

                return (
                  <div
                    key={rowIndex}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/90 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => togglePreviewRow(rowIndex)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-3"
                    >
                      <div className="text-left">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Fila {rowIndex + 1}
                        </p>
                        {primaryValue && (
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate mt-1">
                            {primaryValue}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                          {fileData.headers.length} campos disponibles
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 border-t border-gray-200 dark:border-gray-800 pt-3">
                        {fileData.headers.map((header, colIndex) => {
                          const rawValue = row[header];
                          const displayValue = rawValue ?? '-';
                          const isLink = typeof header === 'string' && header.toLowerCase().includes('enlace');

                          return (
                            <div key={colIndex} className="rounded-md bg-gray-50 dark:bg-gray-800/60 p-2">
                              <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                {header}
                              </p>
                              {isLink && typeof displayValue === 'string' ? (
                                <a
                                  href={displayValue}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline break-words"
                                >
                                  {displayValue}
                                </a>
                              ) : (
                                <p className="text-xs text-gray-700 dark:text-gray-200 break-words leading-relaxed">
                                  {displayValue}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop table preview */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8">
                  <table className="min-w-[960px] xl:min-w-[1100px] text-xs lg:text-sm border-collapse table-auto">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium border-b sticky left-0 bg-gray-100 dark:bg-gray-700 z-20 text-xs lg:text-sm">#</th>
                        {fileData.headers.map((header, index) => (
                          <th key={index} className="px-3 py-2 text-left font-medium whitespace-nowrap border-b text-xs lg:text-sm">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.preview.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 align-top"
                        >
                          <td className="px-3 py-2 font-medium sticky left-0 bg-white dark:bg-gray-900 z-20 border-r text-xs lg:text-sm">
                            {rowIndex + 1}
                          </td>
                          {fileData.headers.map((header, colIndex) => {
                            const rawValue = row[header];
                            const displayValue = rawValue ?? '-';
                            const isLink = typeof header === 'string' && header.toLowerCase().includes('enlace');

                            return (
                              <td
                                key={colIndex}
                                className="px-3 py-2 align-top text-gray-700 dark:text-gray-300 text-xs lg:text-sm"
                                title={typeof displayValue === 'string' ? displayValue : undefined}
                              >
                                {isLink && typeof displayValue === 'string' ? (
                                  <a
                                    href={displayValue}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block max-w-[220px] sm:max-w-[300px] lg:max-w-[360px] xl:max-w-[420px] text-blue-600 hover:underline truncate text-xs lg:text-sm"
                                  >
                                    {displayValue}
                                  </a>
                                ) : (
                                  <span className="block max-w-[220px] sm:max-w-[300px] lg:max-w-[360px] xl:max-w-[420px] overflow-hidden text-ellipsis whitespace-nowrap text-xs lg:text-sm">
                                    {displayValue}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="sm:hidden">📱 Toca una fila para desplegar todos los campos.</span>
              <span className="hidden sm:inline">💡 Desliza horizontalmente para ver todos los campos.</span>
              <span className="hidden lg:inline text-gray-400">Consejo: Usa la rueda del mouse mientras presionas Shift para desplazarte en horizontal.</span>
            </p>
          </div>

          {/* Extracción de Fechas de Cierre */}
          {fileData.headers.includes('Enlace') && (
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 lg:p-6">
              <div className="space-y-3 sm:space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-8">
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg mb-2 flex items-center">
                    <span className="text-xl sm:text-2xl mr-2">📅</span>
                    <span className="text-sm sm:text-base">Extracción de Fechas de Cierre</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3 sm:mb-0 lg:max-w-2xl">
                    Este archivo contiene enlaces a licitaciones. Puedes extraer automáticamente las fechas de presentación de ofertas visitando cada URL.
                  </p>
                </div>
                <div className="w-full sm:w-auto lg:flex-shrink-0">
                  <button
                    onClick={handleExtractDeadlines}
                    disabled={extractingDeadlines}
                    className="btn-primary flex items-center space-x-2 w-full justify-center text-sm sm:text-base lg:min-w-[260px]"
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 lg:p-4 rounded text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Exitosos</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700">{deadlineResults.summary.ok || 0}</p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 lg:p-4 rounded text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">No encontrados</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-700">{deadlineResults.summary.not_found || 0}</p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 lg:p-4 rounded text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Errores</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-700">
                        {(deadlineResults.summary.invalid_url || 0) + (deadlineResults.summary.parse_error || 0) + (deadlineResults.summary.timeout || 0) + (deadlineResults.summary.navigation_error || 0)}
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 lg:p-4 rounded text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-700">{deadlineResults.summary.total}</p>
                    </div>
                  </div>

                  {/* Tabla de resultados */}
                  <div className="space-y-3">
                    <div className="sm:hidden space-y-3 max-h-96 overflow-y-auto pr-1">
                      {deadlineResults.results.map((result, idx) => {
                        const isExpanded = expandedDeadlineRow === idx;
                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/90 shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => toggleDeadlineRow(idx)}
                              className="w-full flex items-center justify-between gap-3 px-3 py-3"
                            >
                              <div className="text-left">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                  Enlace {idx + 1}
                                </p>
                                <p className="text-xs text-blue-600 truncate mt-1">
                                  {result.enlace}
                                </p>
                                {result.normalized && (
                                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                    Fecha: {result.normalized}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-2 py-1 rounded text-[11px] font-semibold uppercase ${
                                    result.status === 'ok'
                                      ? 'bg-green-100 text-green-800'
                                      : result.status === 'not_found'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {result.status}
                                </span>
                                <ChevronDown
                                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-3 pb-3 space-y-2 border-t border-gray-200 dark:border-gray-800 pt-3">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">URL completa</p>
                                  <a
                                    href={result.enlace}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline break-words"
                                  >
                                    {result.enlace}
                                  </a>
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Fecha normalizada</p>
                                  <p className="text-xs font-mono text-gray-700 dark:text-gray-200">
                                    {result.normalized || '-'}
                                  </p>
                                </div>
                                {result.meta?.reason && (
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Detalle</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-200 break-words leading-relaxed">
                                      {result.meta.reason}
                                    </p>
                                  </div>
                                )}
                                {result.datosCompletos && (
                                  <button
                                    onClick={() => {
                                      setSelectedContrato(result.datosCompletos);
                                      setShowDetalleModal(true);
                                    }}
                                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Ver detalles completos del contrato"
                                  >
                                    Ver detalles del contrato
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="hidden sm:block">
                      <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <div className="inline-block min-w-full align-middle px-2 sm:px-0">
                          <table className="w-full text-xs lg:text-sm">
                            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th className="px-2 sm:px-3 py-2 text-left sticky left-0 bg-gray-200 dark:bg-gray-700 z-10 text-xs lg:text-sm">#</th>
                                <th className="px-2 sm:px-3 py-2 text-left text-xs lg:text-sm">Enlace</th>
                                <th className="px-2 sm:px-3 py-2 text-left whitespace-nowrap text-xs lg:text-sm">Fecha</th>
                                <th className="px-2 sm:px-3 py-2 text-left text-xs lg:text-sm">Estado</th>
                                <th className="px-2 sm:px-3 py-2 text-center text-xs lg:text-sm">Ver</th>
                              </tr>
                            </thead>
                            <tbody>
                              {deadlineResults.results.map((result, idx) => (
                                <tr key={idx} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <td className="px-2 sm:px-3 py-2 sticky left-0 bg-white dark:bg-gray-900 z-10 align-top text-xs lg:text-sm">{idx + 1}</td>
                                  <td className="px-2 sm:px-3 py-2 align-top">
                                    <a
                                      href={result.enlace}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block max-w-[220px] sm:max-w-[260px] lg:max-w-[340px] xl:max-w-[420px] truncate text-blue-600 hover:underline text-xs lg:text-sm"
                                    >
                                      {result.enlace}
                                    </a>
                                  </td>
                                  <td className="px-2 sm:px-3 py-2 font-mono text-xs lg:text-sm font-semibold whitespace-nowrap">
                                    {result.normalized || '-'}
                                  </td>
                                  <td className="px-2 sm:px-3 py-2">
                                    <span className={`px-2 py-1 rounded text-xs lg:text-sm font-medium whitespace-nowrap ${
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:justify-end">
            <button onClick={resetImport} className="btn-secondary flex-1 text-sm sm:text-base py-3 sm:py-2 lg:flex-none lg:px-6">
              Cancelar
            </button>
            <button onClick={handleImport} className="btn-primary flex-1 text-sm sm:text-base py-3 sm:py-2 lg:flex-none lg:px-6">
              Iniciar Importación
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 3 && (
  <div className="card text-center py-8 sm:py-12 lg:py-16">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="card bg-blue-50 dark:bg-blue-900/20 text-center p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Total</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">{importResults.totalRecords}</p>
            </div>
            <div className="card bg-green-50 dark:bg-green-900/20 text-center p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Exitosos</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">{importResults.successful}</p>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mt-1 sm:mt-2" />
            </div>
            <div className="card bg-yellow-50 dark:bg-yellow-900/20 text-center p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Duplicados</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-600">{importResults.duplicates}</p>
            </div>
            <div className="card bg-red-50 dark:bg-red-900/20 text-center p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Fallidos</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600">{importResults.failed}</p>
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mx-auto mt-1 sm:mt-2" />
            </div>
          </div>

          {/* Success rate */}
          <div className="card lg:p-6">
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:justify-end">
            <button onClick={resetImport} className="btn-secondary flex-1 text-sm sm:text-base py-3 sm:py-2 lg:flex-none lg:px-6">
              Nueva Importación
            </button>
            <button
              onClick={() => navigate('/history')}
              className="btn-primary flex-1 text-sm sm:text-base py-3 sm:py-2 lg:flex-none lg:px-6"
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


