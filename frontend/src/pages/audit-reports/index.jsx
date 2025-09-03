import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AuditReports = () => {
  const location = useLocation();
  const [auditId, setAuditId] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [crossResults, setCrossResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener auditId desde URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const auditIdFromUrl = urlParams.get('auditId');
    if (auditIdFromUrl) {
      setAuditId(auditIdFromUrl);
    }
  }, [location]);

  // Cargar datos de la auditoría y reportes
  useEffect(() => {
    if (auditId) {
      loadAuditReports();
    }
  }, [auditId]);

  const loadAuditReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos de la auditoría
      const auditResponse = await fetch(`http://localhost:50001/api/audits/${auditId}`);
      if (auditResponse.ok) {
        const audit = await auditResponse.json();
        setAuditData(audit);
        setProcessedFiles(audit.processedFiles || []);
      }

      // Cargar resultados de cruces con datos completos
      const crossResponse = await fetch(`http://localhost:50001/api/cross-results/${auditId}?includeResults=true`);
      if (crossResponse.ok) {
        const crossData = await crossResponse.json();
        setCrossResults(crossData.data || []);
      }

    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('Error al cargar los reportes de la auditoría');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadReport = (type, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${auditId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando reportes...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={24} className="text-red-500 mr-3" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="BarChart3" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Reportes y Análisis
                </h1>
                <p className="text-muted-foreground">
                  Información detallada de la auditoría {auditId}
                </p>
              </div>
            </div>

            {/* Audit Info Card */}
            {auditData && (
              <div className="bg-white border border-border rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Información de Auditoría</h3>
                    <p className="text-sm text-muted-foreground">ID: {auditData.auditId}</p>
                    <p className="text-sm text-muted-foreground">Tipo: {auditData.type}</p>
                    <p className="text-sm text-muted-foreground">Ubicación: {auditData.location}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Estado y Fechas</h3>
                    <p className="text-sm text-muted-foreground">Estado: {auditData.status}</p>
                    <p className="text-sm text-muted-foreground">Auditor: {auditData.auditor}</p>
                    <p className="text-sm text-muted-foreground">Creado: {formatDate(auditData.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Progreso</h3>
                    <p className="text-sm text-muted-foreground">Completado: {auditData.completionPercentage || 0}%</p>
                    <p className="text-sm text-muted-foreground">Archivos procesados: {processedFiles.length}</p>
                    <p className="text-sm text-muted-foreground">Cruces realizados: {crossResults.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Archivos Procesados */}
            <div className="bg-white border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center">
                  <Icon name="FileText" size={20} className="mr-2" />
                  Archivos Procesados
                </h2>
                {processedFiles.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport('archivos_procesados', processedFiles)}
                    iconName="Download"
                    iconPosition="left"
                  >
                    Descargar
                  </Button>
                )}
              </div>

              {processedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="FileX" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay archivos procesados para esta auditoría</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {processedFiles.map((file, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{file.filename}</h3>
                        <span className="text-xs text-muted-foreground">{formatDate(file.processedAt)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Registros:</span>
                          <p className="font-medium">{file.totalRows || 0}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Advertencias:</span>
                          <p className="font-medium text-yellow-600">{file.warnings || 0}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Errores:</span>
                          <p className="font-medium text-red-600">{file.errors || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resultados de Cruces */}
            <div className="bg-white border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center">
                  <Icon name="GitMerge" size={20} className="mr-2" />
                  Resultados de Cruces
                </h2>
                {crossResults.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport('resultados_cruces', crossResults)}
                    iconName="Download"
                    iconPosition="left"
                  >
                    Descargar
                  </Button>
                )}
              </div>

              {crossResults.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="GitMerge" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay cruces realizados para esta auditoría</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {crossResults.map((cross, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">Cruce #{cross.crossId}</h3>
                        <span className="text-xs text-muted-foreground">{formatDate(cross.executionDetails?.executedAt)}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Campo clave:</span> {cross.keyField}</p>
                        <p><span className="text-muted-foreground">Campo resultado:</span> {cross.resultField}</p>
                        <p><span className="text-muted-foreground">Archivos:</span> {cross.processedFiles?.length || 0}</p>
                        <p><span className="text-muted-foreground">Resultados:</span> {cross.results?.length || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resumen General */}
          <div className="mt-8 bg-white border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Icon name="PieChart" size={20} className="mr-2" />
              Resumen General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="FileText" size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-2xl text-foreground">{processedFiles.length}</h3>
                <p className="text-sm text-muted-foreground">Archivos Procesados</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="Database" size={24} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-2xl text-foreground">
                  {processedFiles.reduce((sum, file) => sum + (file.totalRows || 0), 0)}
                </h3>
                <p className="text-sm text-muted-foreground">Registros Totales</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="AlertTriangle" size={24} className="text-yellow-600" />
                </div>
                <h3 className="font-semibold text-2xl text-foreground">
                  {processedFiles.reduce((sum, file) => sum + (file.warnings || 0), 0)}
                </h3>
                <p className="text-sm text-muted-foreground">Advertencias</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="XCircle" size={24} className="text-red-600" />
                </div>
                <h3 className="font-semibold text-2xl text-foreground">
                  {processedFiles.reduce((sum, file) => sum + (file.errors || 0), 0)}
                </h3>
                <p className="text-sm text-muted-foreground">Errores</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditReports;
