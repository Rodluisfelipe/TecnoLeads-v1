import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, Download } from 'lucide-react';
import importService from '../services/importService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const History = () => {
  const [loading, setLoading] = useState(true);
  const [imports, setImports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedImport, setSelectedImport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    try {
      const response = await importService.getHistory({ page: currentPage, limit: 10 });
      if (response.success) {
        setImports(response.data.imports);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (importId) => {
    try {
      const response = await importService.getImportDetails(importId);
      if (response.success) {
        setSelectedImport(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar detalles');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertCircle },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'completed' ? 'Completado' :
         status === 'failed' ? 'Fallido' :
         status === 'processing' ? 'Procesando' : 'Pendiente'}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Historial de Importaciones</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Revisa el historial completo de tus importaciones
          </p>
        </div>
      </div>

      {/* Lista de importaciones */}
      {imports.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">No hay importaciones</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Todavía no has realizado ninguna importación
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {imports.map((importItem) => (
            <div
              key={importItem._id}
              className="card-hover"
              onClick={() => viewDetails(importItem._id)}
            >
              <div className="flex items-center justify-between">
                {/* Info principal */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h3 className="font-bold text-lg">{importItem.fileName}</h3>
                    {getStatusBadge(importItem.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total: </span>
                      <span className="font-medium">{importItem.totalRecords}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Exitosos: </span>
                      <span className="font-medium text-green-600">{importItem.successfulRecords}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Duplicados: </span>
                      <span className="font-medium text-yellow-600">{importItem.duplicateRecords}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fallidos: </span>
                      <span className="font-medium text-red-600">{importItem.failedRecords}</span>
                    </div>
                  </div>
                </div>

                {/* Fecha y duración */}
                <div className="text-right ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(importItem.createdAt).toLocaleDateString()}
                  </p>
                  {importItem.duration && (
                    <p className="text-xs text-gray-500">
                      {importItem.duration}s
                    </p>
                  )}
                  {importItem.successRate && (
                    <p className="text-sm font-bold text-green-600 mt-1">
                      {importItem.successRate}% éxito
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn-secondary"
          >
            Anterior
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {pagination.page} de {pagination.pages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
            disabled={currentPage === pagination.pages}
            className="btn-secondary"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedImport && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImport(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Detalles de Importación</h2>
              <button
                onClick={() => setSelectedImport(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Info general */}
            <div className="space-y-4 mb-6">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Archivo:</span>
                <p className="font-medium">{selectedImport.fileName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                <div className="mt-1">{getStatusBadge(selectedImport.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Inicio:</span>
                  <p className="font-medium">
                    {new Date(selectedImport.startTime).toLocaleString()}
                  </p>
                </div>
                {selectedImport.endTime && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fin:</span>
                    <p className="font-medium">
                      {new Date(selectedImport.endTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Errores */}
            {selectedImport.importErrors && selectedImport.importErrors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-3 text-red-600">Errores ({selectedImport.importErrors.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedImport.importErrors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                      <p className="font-medium">Fila {error.row}</p>
                      <p className="text-red-600">{error.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicados */}
            {selectedImport.duplicates && selectedImport.duplicates.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 text-yellow-600">Duplicados ({selectedImport.duplicates.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedImport.duplicates.map((dup, index) => (
                    <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                      <p className="font-medium">Fila {dup.row}</p>
                      <p className="text-yellow-600">{dup.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

