import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function DetalleContratoModal({ isOpen, onClose, datos }) {
  if (!datos) return null;

  const formatearValor = (valor) => {
    if (valor === null || valor === undefined || valor === '') return '(vacío)';
    if (typeof valor === 'object') return JSON.stringify(valor);
    if (typeof valor === 'number') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor);
    }
    if (typeof valor === 'string' && valor.length > 200) {
      return (
        <div className="max-h-32 overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{valor}</p>
        </div>
      );
    }
    return valor;
  };

  const categorias = {
    '🔑 IDENTIFICACIÓN': [
      { key: 'CodigoProceso', label: 'Código Proceso' },
      { key: 'Numero', label: 'Número' },
      { key: 'idContrato', label: 'ID Contrato' },
      { key: 'Random', label: 'Random' }
    ],
    '📋 INFORMACIÓN GENERAL': [
      { key: 'Nombre', label: 'Nombre del Proceso' },
      { key: 'Objeto', label: 'Objeto del Contrato' },
      { key: 'EntidadContratante', label: 'Entidad Contratante' },
      { key: 'name_mostrar', label: 'Nombre Completo Entidad' },
      { key: 'modalidad', label: 'Modalidad' },
      { key: 'name_proceso', label: 'Tipo de Proceso' }
    ],
    '💰 VALORES': [
      { key: 'Valor', label: 'Valor del Contrato' },
      { key: 'Cuantia', label: 'Cuantía' }
    ],
    '📅 FECHAS': [
      { key: 'FechaVencimiento', label: 'Fecha de Vencimiento' },
      { key: 'FechaPublicacion', label: 'Fecha de Publicación' },
      { key: 'FechaCracionSETCON', label: 'Fecha Creación SETCON' },
      { key: 'FechaActualizacionEstado', label: 'Última Actualización' },
      { key: 'fechaUltimoRefresco', label: 'Último Refresco' }
    ],
    '📍 UBICACIÓN': [
      { key: 'TextoDepartamento', label: 'Departamento' },
      { key: 'Ubicacion', label: 'Ubicación' },
      { key: 'departamento', label: 'Depto' },
      { key: 'ciudad', label: 'Ciudad' }
    ],
    '📊 ESTADO': [
      { key: 'Estado', label: 'Estado' },
      { key: 'estado_agrupado', label: 'Estado Agrupado' },
      { key: 'fase', label: 'Fase' }
    ],
    '🏷️ CLASIFICACIÓN': [
      { key: 'Clase', label: 'Clase' },
      { key: 'Grupo', label: 'Grupo' },
      { key: 'Familia', label: 'Familia' },
      { key: 'Segmento', label: 'Segmento' },
      { key: 'actividad_filter', label: 'Actividad' },
      { key: 'Actividad_Economica', label: 'Actividad Económica' },
      { key: 'Codigos_UNSPSC', label: 'Códigos UNSPSC' }
    ],
    '🔗 ENLACES': [
      { key: 'Link', label: 'Enlace SECOP' },
      { key: 'urlproceso', label: 'URL Proceso' },
      { key: 'Enlace', label: 'Enlace' }
    ],
    '📄 DOCUMENTOS': [
      { key: 'NumeroDocumentos', label: 'Número de Documentos' }
    ],
    '🏢 ENTIDAD': [
      { key: 'nit_dian', label: 'NIT' },
      { key: 'nombre_dian', label: 'Razón Social DIAN' },
      { key: 'idDian', label: 'ID DIAN' }
    ]
  };

  const renderCategoria = (titulo, campos) => {
    const camposConDatos = campos.filter(campo => {
      const valor = datos[campo.key];
      return valor !== null && valor !== undefined && valor !== '';
    });

    if (camposConDatos.length === 0) return null;

    return (
      <div key={titulo} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          {titulo}
        </h3>
        <div className="space-y-3">
          {camposConDatos.map(campo => (
            <div key={campo.key} className="grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-500 col-span-1">
                {campo.label}
              </dt>
              <dd className="text-sm text-gray-900 col-span-2">
                {formatearValor(datos[campo.key])}
              </dd>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h2" className="text-2xl font-bold leading-6 text-gray-900 mb-6 pr-8">
                      📋 Detalles del Contrato
                    </Dialog.Title>

                    <div className="mt-6 max-h-[70vh] overflow-y-auto pr-4">
                      {/* Información destacada */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-blue-600 mb-1">CÓDIGO PROCESO</p>
                            <p className="text-lg font-bold text-blue-900">
                              {datos.CodigoProceso || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-600 mb-1">VALOR</p>
                            <p className="text-lg font-bold text-blue-900">
                              {formatearValor(datos.Valor)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-600 mb-1">FECHA CIERRE</p>
                            <p className="text-lg font-bold text-blue-900">
                              {datos.FechaVencimiento || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-600 mb-1">ESTADO</p>
                            <p className="text-lg font-bold text-blue-900">
                              {datos.estado_agrupado || datos.Estado || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Categorías detalladas */}
                      <div className="space-y-6">
                        {Object.entries(categorias).map(([titulo, campos]) => 
                          renderCategoria(titulo, campos)
                        )}
                      </div>

                      {/* Campos adicionales */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center justify-between">
                            <span>🔍 Ver campos adicionales</span>
                            <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">
                              ▼
                            </span>
                          </summary>
                          <div className="mt-4 space-y-2 pl-4">
                            {Object.entries(datos)
                              .filter(([key]) => {
                                // Filtrar campos que ya están en las categorías
                                const todosCampos = Object.values(categorias)
                                  .flat()
                                  .map(c => c.key);
                                return !todosCampos.includes(key);
                              })
                              .map(([key, valor]) => (
                                <div key={key} className="grid grid-cols-3 gap-4 text-xs">
                                  <dt className="font-medium text-gray-500 col-span-1 break-all">
                                    {key}
                                  </dt>
                                  <dd className="text-gray-700 col-span-2 break-words">
                                    {formatearValor(valor)}
                                  </dd>
                                </div>
                              ))}
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                  {datos.Link && (
                    <a
                      href={datos.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      Ver en SECOP II
                    </a>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
