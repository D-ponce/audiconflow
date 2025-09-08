import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const AuditResults = () => {
  const { auditId, crossId } = useParams();
  const navigate = useNavigate();
  const [crossResults, setCrossResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);

  useEffect(() => {
    fetchCrossResults();
  }, [auditId, crossId]);

  const fetchCrossResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url;
      let logMessage;
      
      if (crossId) {
        // Si tenemos crossId específico, buscar solo ese cruce
        url = `http://localhost:5000/api/cross-results/detail/${crossId}`;
        logMessage = `🔍 Buscando cruce específico: ${crossId}`;
      } else {
        // Si no tenemos crossId, buscar todos los cruces de la auditoría
        url = `http://localhost:5000/api/cross-results/${auditId}?includeResults=true`;
        logMessage = `🔍 Buscando resultados de cruce para auditoría: ${auditId}`;
      }
      
      console.log(logMessage);
      const response = await fetch(url);
      console.log('📡 Status de respuesta:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Datos recibidos del backend:', data);
      
      if (crossId) {
        // Para cruce específico, data.data contiene un solo objeto
        if (data.success && data.data) {
          console.log('📋 Cruce específico encontrado:', data.data);
          setCrossResults([data.data]); // Convertir a array para mantener compatibilidad
        } else {
          console.log('ℹ️ No se encontró el cruce específico');
          setCrossResults([]);
        }
      } else {
        // Para múltiples cruces de auditoría
        console.log(`✅ Encontrados ${data.data?.length || 0} cruces para la auditoría ${auditId}`);
        
        if (data.success && data.data && data.data.length > 0) {
          console.log('📋 Primer resultado de ejemplo:', data.data[0]);
          setCrossResults(data.data);
        } else {
          console.log('ℹ️ No se encontraron resultados de cruce para esta auditoría');
          setCrossResults([]);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching cross results:', err);
      setError(`Error al cargar resultados: ${err.message}`);
      setCrossResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowModal(true);
  };

  const handleExportExcel = async (result) => {
    try {
      // Crear datos para exportar
      const exportData = result.results.map(item => ({
        [result.keyField]: item.keyValue,
        [result.resultField]: item.resultValue,
        'Estado': item.status,
        'Archivos': item.sourceFiles.join(', '),
        'Coincidencia': item.matched ? 'Sí' : 'No'
      }));

      // Crear CSV como alternativa
      const csvHeaders = [result.keyField, result.resultField, 'Estado', 'Archivos', 'Coincidencia'];
      const csvRows = exportData.map(row => 
        csvHeaders.map(header => `"${row[header] || ''}"`).join(',')
      );
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows
      ].join('\n');

      // Crear y descargar archivo CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cruce_${result.crossId}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Archivo CSV exportado: cruce_${result.crossId}_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar archivo CSV.');
    }
  };

  const exportToExcel = async (crossId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cross-results/export/${crossId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al exportar datos');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cross_results_${crossId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar a Excel');
    }
  };

  const handleDeleteResult = (result) => {
    setResultToDelete(result);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!resultToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cross-results/${resultToDelete.crossId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deletedBy: localStorage.getItem('currentUser') || 'Usuario'
        })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar resultado de cruce');
      }

      const data = await response.json();
      console.log('✅ Respuesta del servidor:', data);

      // Actualizar la lista eliminando el resultado
      setCrossResults(prev => prev.filter(r => r._id !== resultToDelete._id));
      
      // Cerrar modal de confirmación
      setShowDeleteConfirm(false);
      setResultToDelete(null);
      
      console.log(`✅ Resultado de cruce ${resultToDelete.crossId} eliminado exitosamente de la base de datos`);
      console.log(`🗑️ Documento MongoDB eliminado: ${data.deletedId}`);
      
      // Mostrar mensaje de éxito al usuario
      alert('Resultado de cruce eliminado exitosamente de la base de datos');
    } catch (error) {
      console.error('❌ Error eliminando resultado:', error);
      alert('Error al eliminar el resultado de cruce de la base de datos');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setResultToDelete(null);
  };

  const filteredResults = crossResults.filter(result => {
    const matchesSearch = result.crossId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.keyField?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.resultField?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || result.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Cargando resultados de cruce...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-xl mb-4">⚠️ Error de Conexión</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <div className="text-sm text-gray-500 mb-4">
            Posibles causas:
            <ul className="list-disc text-left mt-2 ml-4">
              <li>El servidor backend no está ejecutándose</li>
              <li>MongoDB no está conectado</li>
              <li>No hay datos de cruce para esta auditoría</li>
            </ul>
          </div>
          <button 
            onClick={fetchCrossResults}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Resultados de Cruce</h1>
            <p className="text-muted-foreground">
              Auditoría: {auditId}
              {crossId && <span className="ml-2">| Cruce: {crossId}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {crossResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icon name="BarChart3" size={20} className="text-primary" />
              <span className="text-sm font-medium">Total Cruces</span>
            </div>
            <p className="text-2xl font-bold mt-1">{crossResults.length}</p>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" size={20} className="text-green-500" />
              <span className="text-sm font-medium">Completados</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {crossResults.filter(r => r.status === 'Completado').length}
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icon name="FileText" size={20} className="text-blue-500" />
              <span className="text-sm font-medium">Registros Procesados</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {crossResults.reduce((sum, r) => sum + (r.summary?.totalRecords || 0), 0)}
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icon name="Percent" size={20} className="text-orange-500" />
              <span className="text-sm font-medium">% Promedio Coincidencia</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {crossResults.length > 0 ? 
                (crossResults.reduce((sum, r) => sum + (parseFloat(r.summary?.matchPercentage) || 0), 0) / crossResults.length).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por ID de cruce, campo clave o resultado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos los estados</option>
          <option value="Completado">Completado</option>
          <option value="Fallido">Fallido</option>
          <option value="En Proceso">En Proceso</option>
        </select>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
          <p className="text-muted-foreground mb-6">
            {crossId 
              ? 'No se encontró el cruce específico solicitado.'
              : crossResults.length === 0 
                ? 'No hay cruces de información realizados para esta auditoría.'
                : 'No hay resultados que coincidan con los filtros aplicados.'
            }
          </p>
          {crossResults.length === 0 && !crossId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-blue-800 font-medium mb-2">💡 Para generar cruces:</div>
              <ol className="text-blue-700 text-sm text-left list-decimal list-inside space-y-1">
                <li>Ve a "Carga y procesamiento de archivos"</li>
                <li>Sube los archivos Excel necesarios</li>
                <li>Ejecuta el cruce de información</li>
                <li>Los resultados aparecerán automáticamente aquí</li>
              </ol>
            </div>
          )}
          {crossResults.length === 0 && crossId && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-red-800 font-medium mb-2">❌ Cruce no encontrado</div>
              <p className="text-red-700 text-sm">
                El cruce con ID "{crossId}" no existe o no pertenece a esta auditoría.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/audit-results/${auditId}`)}
                className="mt-3"
              >
                Ver todos los cruces de la auditoría
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <div key={result._id} className="bg-card border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{result.crossId}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      result.status === 'Completado' 
                        ? 'bg-green-100 text-green-800'
                        : result.status === 'Fallido'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Campo Clave:</span>
                      <p className="text-muted-foreground">{result.keyField}</p>
                    </div>
                    <div>
                      <span className="font-medium">Campo Resultado:</span>
                      <p className="text-muted-foreground">{result.resultField}</p>
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span>
                      <p className="text-muted-foreground">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {result.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <span className="font-medium">Total Registros:</span>
                        <p className="text-muted-foreground">{result.summary.totalRecords}</p>
                      </div>
                      <div>
                        <span className="font-medium">Coincidencias:</span>
                        <p className="text-muted-foreground">{result.summary.matchingRecords}</p>
                      </div>
                      <div>
                        <span className="font-medium">% Coincidencia:</span>
                        <p className="text-muted-foreground">{result.summary.matchPercentage}%</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(result)}
                    iconName="Eye"
                    iconPosition="left"
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportExcel(result)}
                    iconName="Download"
                    iconPosition="left"
                    className="text-green-600 hover:text-green-700 hover:border-green-300"
                  >
                    Exportar CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteResult(result)}
                    iconName="Trash2"
                    iconPosition="left"
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Detalles del Cruce</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                iconName="X"
              />
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Información General</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">ID:</span> {selectedResult.crossId}</div>
                    <div><span className="font-medium">Campo Clave:</span> {selectedResult.keyField}</div>
                    <div><span className="font-medium">Campo Resultado:</span> {selectedResult.resultField}</div>
                    <div><span className="font-medium">Estado:</span> {selectedResult.status}</div>
                    <div><span className="font-medium">Ejecutado por:</span> {selectedResult.executionDetails?.executedBy}</div>
                  </div>
                </div>
                
                {selectedResult.summary && (
                  <div>
                    <h3 className="font-medium mb-2">Estadísticas</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Total Registros:</span> {selectedResult.summary.totalRecords}</div>
                      <div><span className="font-medium">Coincidencias:</span> {selectedResult.summary.matchingRecords}</div>
                      <div><span className="font-medium">% Coincidencia:</span> {selectedResult.summary.matchPercentage}%</div>
                    </div>
                  </div>
                )}
              </div>

              {selectedResult.results && selectedResult.results.length > 0 && (
                <div>
                  <h3 className="font-medium mb-4">Resultados ({selectedResult.results.length} registros)</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left p-3 border-b">Valor Clave</th>
                            <th className="text-left p-3 border-b">Resultado</th>
                            <th className="text-left p-3 border-b">Estado</th>
                            <th className="text-left p-3 border-b">Archivos Origen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedResult.results.slice(0, 100).map((result, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="p-3">{result.keyValue}</td>
                              <td className="p-3">{result.resultValue || 'N/A'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  result.matched 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {result.status}
                                </span>
                              </td>
                              <td className="p-3">
                                {result.sourceFiles?.join(', ') || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {selectedResult.results.length > 100 && (
                      <div className="p-3 text-center text-sm text-muted-foreground border-t">
                        Mostrando primeros 100 de {selectedResult.results.length} resultados
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && resultToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="AlertTriangle" size={24} className="text-red-500" />
              <h2 className="text-xl font-semibold">Confirmar Eliminación</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-muted-foreground mb-2">
                ¿Estás seguro de que deseas eliminar este resultado de cruce?
              </p>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium">ID: {resultToDelete.crossId}</p>
                <p className="text-sm text-muted-foreground">
                  Campo Clave: {resultToDelete.keyField} | Campo Resultado: {resultToDelete.resultField}
                </p>
                <p className="text-sm text-muted-foreground">
                  Registros: {resultToDelete.summary?.totalRecords || 0} | 
                  Coincidencias: {resultToDelete.summary?.matchingRecords || 0}
                </p>
              </div>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                iconName="Trash2"
                iconPosition="left"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditResults;
