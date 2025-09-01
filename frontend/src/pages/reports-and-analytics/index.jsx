import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import crossResultService from '../../services/crossResultService';

import Button from '../../components/ui/Button';
import ReportBuilder from './components/ReportBuilder';
import ReportTemplates from './components/ReportTemplates';
import VisualizationArea from './components/VisualizationArea';
import ExportOptions from './components/ExportOptions';
import ReportScheduler from './components/ReportScheduler';
import SavedReports from './components/SavedReports';
import AdvancedFilters from './components/AdvancedFilters';

const ReportsAndAnalytics = () => {
  // Recibir datos del cruce desde la navegación
  const location = useLocation();
  const crossResults = location.state?.crossResults;
  const selectedKey = location.state?.selectedKey;
  const selectedResult = location.state?.selectedResult;
  const selectedFiles = location.state?.selectedFiles;
  const auditData = location.state?.auditData;
  
  // Obtener auditId desde múltiples fuentes
  const [currentAuditId, setCurrentAuditId] = useState(null);
  const [auditInfo, setAuditInfo] = useState(null);
  
  useEffect(() => {
    // Prioridad: URL params > state > localStorage
    const urlParams = new URLSearchParams(location.search);
    const auditIdFromUrl = urlParams.get('auditId');
    
    let auditId = auditIdFromUrl || 
                  auditData?._id || 
                  auditData?.auditId || 
                  localStorage.getItem('currentAuditId');
    
    if (auditId) {
      setCurrentAuditId(auditId);
      localStorage.setItem('currentAuditId', auditId);
      
      // Si tenemos datos de auditoría, usarlos
      if (auditData) {
        setAuditInfo(auditData);
      }
    }
  }, [location, auditData]);

  const [activeTab, setActiveTab] = useState(crossResults ? 'cross-results' : 'visualization');
  const [currentReport, setCurrentReport] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const tabs = [
    { id: 'visualization', label: 'Visualización', icon: 'BarChart3' },
    { id: 'cross-results', label: 'Resultados del Cruce', icon: 'GitMerge' },
    { id: 'export', label: 'Reporte', icon: 'FileText' },
    { id: 'saved', label: 'Guardados', icon: 'FolderOpen' }
  ];

  const handleGenerateReport = (config) => {
    console.log('Generando reporte con configuración:', config);
    setCurrentReport(config);
    setActiveTab('visualization');
  };

  const handleSelectTemplate = (template) => {
    console.log('Plantilla seleccionada:', template);
    setCurrentReport(template);
    setActiveTab('visualization');
  };

  const handleExport = async (savedReport) => {
    console.log('Reporte guardado:', savedReport);
    
    // Actualizar la lista de reportes guardados
    if (activeTab === 'saved') {
      // Forzar actualización de la pestaña de guardados
      window.location.reload();
    } else {
      // Cambiar a la pestaña de guardados para mostrar el nuevo reporte
      setActiveTab('saved');
    }
  };

  const handleScheduleReport = (scheduleConfig) => {
    console.log('Programando reporte:', scheduleConfig);
    alert('Reporte programado exitosamente');
  };

  const handleLoadReport = (report) => {
    console.log('Cargando reporte:', report);
    setCurrentReport(report);
    setActiveTab('visualization');
  };

  const handleShareReport = (report) => {
    console.log('Compartiendo reporte:', report);
    alert(`Compartiendo reporte: ${report.name}`);
  };

  // Efecto para guardar automáticamente los resultados del cruce
  useEffect(() => {
    if (crossResults && crossResults.results && !saveStatus) {
      saveCrossResultsToDB();
    }
  }, [crossResults]);

  const saveCrossResultsToDB = async () => {
    if (!crossResults || !crossResults.results) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Obtener información del usuario actual
      const currentUser = localStorage.getItem('currentUser') || 'Usuario Anónimo';
      
      // Usar el auditId actual o un valor por defecto
      const auditIdToUse = currentAuditId || localStorage.getItem('currentAuditId') || 'AUDIT_DEFAULT';

      // Formatear datos para la API
      const crossData = {
        auditId: auditIdToUse,
        keyField: selectedKey || 'RUT',
        resultField: selectedResult || 'Tipo de cuenta',
        processedFiles: selectedFiles?.map(file => ({
          filename: file,
          originalName: file,
          recordCount: crossResults.results?.length || 0
        })) || [],
        results: crossResults.results.map(result => ({
          keyValue: result.valor || result.key,
          resultValue: result.resultadoAsignado || result.value || 'N/A',
          status: result.resultado || result.status,
          sourceFiles: result.archivos || result.files || [],
          metadata: {
            originalData: result
          }
        })),
        executedBy: currentUser
      };

      const response = await crossResultService.saveCrossResult(crossData);

      if (response.success) {
        setSaveStatus({
          type: 'success',
          message: 'Resultados guardados exitosamente en la base de datos',
          crossId: response.data?.data?.crossId
        });
      } else {
        setSaveStatus({
          type: 'error',
          message: response.message || 'Error al guardar los resultados'
        });
      }
    } catch (error) {
      console.error('Error al guardar resultados del cruce:', error);
      setSaveStatus({
        type: 'error',
        message: 'Error inesperado al guardar los resultados'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyFilters = (filters) => {
    console.log('Aplicando filtros:', filters);
  };

  const handleResetFilters = () => {
    console.log('Limpiando filtros');
  };

  const handleExportData = (format) => {
    if (!crossResults || !crossResults.results) {
      alert('No hay datos para exportar');
      return;
    }

    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'excel') {
      exportToExcel();
    }
  };

  const exportToCSV = () => {
    const headers = [selectedKey, selectedResult, 'Estado', 'Archivos'];
    const csvContent = [
      headers.join(','),
      ...crossResults.results.map(result => [
        `"${result.valor}"`,
        `"${result.resultadoAsignado || 'N/A'}"`,
        `"${result.resultado}"`,
        `"${result.archivos?.join('; ') || 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cruce_informacion_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cross-check/report');
      if (!response.ok) throw new Error('Error al generar reporte Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cruce_informacion_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Error al exportar a Excel. Intenta con CSV.');
    }
  };

  const renderCrossResults = () => {
    if (!crossResults) {
      return (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">No hay resultados de cruce disponibles.</p>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-6">
          {/* Información de la auditoría */}
          {(currentAuditId || auditInfo) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600 font-semibold">🔗 Vinculado a Auditoría</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ID de Auditoría:</span>
                  <p className="font-medium text-gray-900">{currentAuditId}</p>
                </div>
                {auditInfo && (
                  <>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <p className="font-medium text-gray-900">{auditInfo.type || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Ubicación:</span>
                      <p className="font-medium text-gray-900">{auditInfo.location || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <p className="font-medium text-gray-900">{auditInfo.status || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-foreground">Resultados del Cruce de Información</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                onClick={() => handleExportData('excel')}
              >
                Exportar Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="FileText"
                onClick={() => handleExportData('csv')}
              >
                Exportar CSV
              </Button>
              {isSaving && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Loader2"
                  disabled
                >
                  Guardando...
                </Button>
              )}
            </div>
          </div>
          
          {/* Estado de guardado */}
          {saveStatus && (
            <div className={`mb-4 p-3 rounded-lg border ${
              saveStatus.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {saveStatus.type === 'success' ? '✅' : '❌'} {saveStatus.message}
                </span>
                {saveStatus.crossId && (
                  <span className="text-xs text-muted-foreground">
                    ID: {saveStatus.crossId}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="bg-muted/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Campo clave:</strong> {selectedKey}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Campo resultado:</strong> {selectedResult}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Archivos procesados:</strong> {selectedFiles?.join(', ')}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Total de registros:</strong> {crossResults.results?.length || 0}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-3 text-left font-semibold text-foreground">
                  {selectedKey}
                </th>
                <th className="border border-border p-3 text-left font-semibold text-foreground">
                  {selectedResult}
                </th>
                <th className="border border-border p-3 text-left font-semibold text-foreground">
                  Estado
                </th>
                <th className="border border-border p-3 text-left font-semibold text-foreground">
                  Archivos
                </th>
              </tr>
            </thead>
            <tbody>
              {crossResults.results?.map((result, index) => (
                <tr key={index} className="hover:bg-muted/20">
                  <td className="border border-border p-3 text-foreground font-medium">
                    {result.valor}
                  </td>
                  <td className="border border-border p-3 text-muted-foreground">
                    {result.resultadoAsignado || 'N/A'}
                  </td>
                  <td className="border border-border p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.resultado === 'hay coincidencia' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.resultado}
                    </span>
                  </td>
                  <td className="border border-border p-3 text-muted-foreground text-sm">
                    {result.archivos?.join(', ') || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visualization':
        return <VisualizationArea reportData={crossResults || currentReport} reportType={crossResults ? 'cross-check' : currentReport?.reportType} />;
      case 'cross-results':
        return renderCrossResults();
      case 'export':
        return <ExportOptions onExport={handleExport} />;
      case 'saved':
        return <SavedReports onLoadReport={handleLoadReport} onShareReport={handleShareReport} />;
      default:
        return <VisualizationArea reportData={crossResults || currentReport} reportType={crossResults ? 'cross-check' : currentReport?.reportType} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      <Header />
      <main className="pt-16">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 glass-effect border-r border-white/20 flex flex-col shadow-xl">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Reportes y Análisis</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(false)}
                    iconName="PanelLeftClose"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Genere informes detallados y análisis de datos de auditoría con herramientas avanzadas de visualización.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <AdvancedFilters 
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleResetFilters}
                  />
                </div>

                <div className="p-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Accesos Rápidos</h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      iconName="TrendingUp"
                      iconPosition="left"
                      className="justify-start"
                    >
                      Tendencias de Cumplimiento
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      iconName="Users"
                      iconPosition="left"
                      className="justify-start"
                    >
                      Rendimiento de Auditores
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      iconName="MapPin"
                      iconPosition="left"
                      className="justify-start"
                    >
                      Comparación de Ubicaciones
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      iconName="AlertTriangle"
                      iconPosition="left"
                      className="justify-start"
                    >
                      Análisis de Riesgos
                    </Button>
                  </div>
                </div>

                <div className="p-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Estadísticas Rápidas</h3>
                  <div className="space-y-3">
                    <div className="glass-effect rounded-lg p-3 hover:bg-white/30 transition-all duration-200">
                      <div className="text-lg font-bold text-primary">94%</div>
                      <div className="text-xs text-muted-foreground">Cumplimiento Promedio</div>
                    </div>
                    <div className="glass-effect rounded-lg p-3 hover:bg-white/30 transition-all duration-200">
                      <div className="text-lg font-bold text-success">142</div>
                      <div className="text-xs text-muted-foreground">Auditorías Este Mes</div>
                    </div>
                    <div className="glass-effect rounded-lg p-3 hover:bg-white/30 transition-all duration-200">
                      <div className="text-lg font-bold text-warning">8</div>
                      <div className="text-xs text-muted-foreground">Incidencias Pendientes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="glass-effect border-b border-white/20 px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {!showSidebar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSidebar(true)}
                      iconName="PanelLeftOpen"
                      className="mr-4"
                    />
                  )}
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      iconName={tab.icon}
                      iconPosition="left"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" iconName="RefreshCw">
                    Actualizar
                  </Button>
                  <Button variant="outline" size="sm" iconName="HelpCircle">
                    Ayuda
                  </Button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsAndAnalytics;