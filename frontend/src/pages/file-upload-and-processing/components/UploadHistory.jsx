import React, { useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle, Trash2, Eye } from 'lucide-react';
import fileUploadHistoryService from '../../../services/fileUploadHistoryService';

const UploadHistory = ({ auditId, onRefresh }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (auditId) {
      fetchHistory();
    }
  }, [auditId]);

  const fetchHistory = async () => {
    if (!auditId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fileUploadHistoryService.getHistoryByAudit(auditId);
      setHistory(data);
    } catch (err) {
      setError('Error al cargar el historial de archivos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      return;
    }

    try {
      await fileUploadHistoryService.deleteHistoryRecord(recordId);
      setHistory(prev => prev.filter(record => record._id !== recordId));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error al eliminar registro:', err);
      alert('Error al eliminar el registro');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!auditId) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Historial de Carga de Datos
        </h3>
        <div className="text-center py-8 text-gray-500">
          Selecciona una auditoría para ver el historial de archivos
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Historial de Carga de Datos
          </h3>
          <button
            onClick={fetchHistory}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando historial...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay archivos cargados para esta auditoría</p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            {history.map((record) => (
              <div
                key={record._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(record.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {record.originalName}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fileUploadHistoryService.getStatusColor(record.status)}`}>
                          {fileUploadHistoryService.getStatusText(record.status)}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{fileUploadHistoryService.formatFileSize(record.fileSize)}</span>
                        <span>{record.fileType}</span>
                        <span>{fileUploadHistoryService.formatDate(record.createdAt)}</span>
                        <span>Por: {record.uploadedBy}</span>
                      </div>

                      {record.processingResults && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Procesamiento:</span>
                          {record.processingResults.recordCount && (
                            <span className="ml-1">{record.processingResults.recordCount} registros</span>
                          )}
                          {record.processingResults.columns && (
                            <span className="ml-2">{record.processingResults.columns.length} columnas</span>
                          )}
                        </div>
                      )}

                      {record.crossResults && record.crossResults.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Cruces realizados:</span>
                          <span className="ml-1">{record.crossResults.length}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record._id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalles del Archivo
                </h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Información General</h4>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nombre original:</span>
                    <p className="font-medium">{selectedRecord.originalName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tamaño:</span>
                    <p className="font-medium">{fileUploadHistoryService.formatFileSize(selectedRecord.fileSize)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-medium">{selectedRecord.fileType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cargado por:</span>
                    <p className="font-medium">{selectedRecord.uploadedBy}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fecha de carga:</span>
                    <p className="font-medium">{fileUploadHistoryService.formatDate(selectedRecord.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fileUploadHistoryService.getStatusColor(selectedRecord.status)}`}>
                      {fileUploadHistoryService.getStatusText(selectedRecord.status)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedRecord.processingResults && (
                <div>
                  <h4 className="font-medium text-gray-900">Resultados de Procesamiento</h4>
                  <div className="mt-2 text-sm">
                    {selectedRecord.processingResults.recordCount && (
                      <p><span className="text-gray-500">Registros:</span> {selectedRecord.processingResults.recordCount}</p>
                    )}
                    {selectedRecord.processingResults.columns && (
                      <p><span className="text-gray-500">Columnas:</span> {selectedRecord.processingResults.columns.join(', ')}</p>
                    )}
                    {selectedRecord.processingResults.processingTime && (
                      <p><span className="text-gray-500">Tiempo de procesamiento:</span> {selectedRecord.processingResults.processingTime}ms</p>
                    )}
                  </div>
                </div>
              )}

              {selectedRecord.crossResults && selectedRecord.crossResults.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">Cruces Realizados</h4>
                  <div className="mt-2 space-y-2">
                    {selectedRecord.crossResults.map((cross, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                        <p><span className="text-gray-500">Campo clave:</span> {cross.keyField}</p>
                        <p><span className="text-gray-500">Campo resultado:</span> {cross.resultField}</p>
                        <p><span className="text-gray-500">Coincidencias:</span> {cross.matchCount} de {cross.totalRecords}</p>
                        <p><span className="text-gray-500">Fecha:</span> {fileUploadHistoryService.formatDate(cross.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadHistory;
