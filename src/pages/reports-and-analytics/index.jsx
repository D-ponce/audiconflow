import React, { useState } from 'react';
import Header from '../../components/ui/Header';

import Button from '../../components/ui/Button';
import ReportBuilder from './components/ReportBuilder';
import ReportTemplates from './components/ReportTemplates';
import VisualizationArea from './components/VisualizationArea';
import ExportOptions from './components/ExportOptions';
import ReportScheduler from './components/ReportScheduler';
import SavedReports from './components/SavedReports';
import AdvancedFilters from './components/AdvancedFilters';

const ReportsAndAnalytics = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [currentReport, setCurrentReport] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const tabs = [
    { id: 'builder', label: 'Constructor', icon: 'Settings' },
    { id: 'templates', label: 'Plantillas', icon: 'FileText' },
    { id: 'visualization', label: 'Visualización', icon: 'BarChart3' },
    { id: 'export', label: 'Exportar', icon: 'Download' },
    { id: 'schedule', label: 'Programar', icon: 'Calendar' },
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

  const handleExport = (exportConfig) => {
    console.log('Exportando reporte:', exportConfig);
    // Simular descarga
    alert(`Reporte exportado en formato ${exportConfig.format.toUpperCase()}`);
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

  const handleApplyFilters = (filters) => {
    console.log('Aplicando filtros:', filters);
  };

  const handleResetFilters = () => {
    console.log('Limpiando filtros');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'builder':
        return <ReportBuilder onGenerateReport={handleGenerateReport} />;
      case 'templates':
        return <ReportTemplates onSelectTemplate={handleSelectTemplate} />;
      case 'visualization':
        return <VisualizationArea reportData={currentReport} reportType={currentReport?.reportType} />;
      case 'export':
        return <ExportOptions onExport={handleExport} />;
      case 'schedule':
        return <ReportScheduler onScheduleReport={handleScheduleReport} />;
      case 'saved':
        return <SavedReports onLoadReport={handleLoadReport} onShareReport={handleShareReport} />;
      default:
        return <ReportBuilder onGenerateReport={handleGenerateReport} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 bg-card border-r border-border flex flex-col">
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
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-lg font-bold text-primary">94%</div>
                      <div className="text-xs text-muted-foreground">Cumplimiento Promedio</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-lg font-bold text-success">142</div>
                      <div className="text-xs text-muted-foreground">Auditorías Este Mes</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
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
            <div className="bg-card border-b border-border px-6 py-4">
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
      </div>
    </div>
  );
};

export default ReportsAndAnalytics;