import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ReportBuilder = ({ onGenerateReport }) => {
  const [reportConfig, setReportConfig] = useState({
    dataSource: '',
    dateRange: 'last30days',
    startDate: '',
    endDate: '',
    locations: [],
    auditTypes: [],
    reportType: 'compliance'
  });

  const dataSourceOptions = [
    { value: 'all', label: 'Todas las fuentes' },
    { value: 'audits', label: 'Auditorías completadas' },
    { value: 'pending', label: 'Auditorías pendientes' },
    { value: 'compliance', label: 'Datos de cumplimiento' },
    { value: 'inventory', label: 'Datos de inventario' }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'last7days', label: 'Últimos 7 días' },
    { value: 'last30days', label: 'Últimos 30 días' },
    { value: 'last90days', label: 'Últimos 90 días' },
    { value: 'custom', label: 'Rango personalizado' }
  ];

  const locationOptions = [
    { value: 'casa-matriz', label: 'Casa Matriz' },
    { value: 'centro-distribucion-s', label: 'Centro de distribución S' },
    { value: 'centro-distribucion-p', label: 'Centro de Distribución P' },
    { value: 'locales', label: 'Locales' },
    { value: 'tiendas', label: 'Tiendas' }
  ];

  const auditTypeOptions = [
    { value: 'inventory', label: 'Auditoría de Inventario' },
    { value: 'compliance', label: 'Auditoría de Cumplimiento' },
    { value: 'financial', label: 'Auditoría Financiera' },
    { value: 'operational', label: 'Auditoría Operacional' },
    { value: 'security', label: 'Auditoría de Seguridad' }
  ];

  const reportTypeOptions = [
    { value: 'compliance', label: 'Tendencias de Cumplimiento' },
    { value: 'performance', label: 'Rendimiento de Auditores' },
    { value: 'location', label: 'Comparación de Ubicaciones' },
    { value: 'summary', label: 'Resumen Ejecutivo' },
    { value: 'detailed', label: 'Análisis Detallado' }
  ];

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = () => {
    onGenerateReport(reportConfig);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="Settings" size={20} color="var(--color-primary)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Constructor de Reportes</h3>
          <p className="text-sm text-muted-foreground">Configure los parámetros para generar su reporte personalizado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Select
            label="Fuente de Datos"
            options={dataSourceOptions}
            value={reportConfig.dataSource}
            onChange={(value) => handleConfigChange('dataSource', value)}
            placeholder="Seleccionar fuente de datos"
          />

          <Select
            label="Rango de Fechas"
            options={dateRangeOptions}
            value={reportConfig.dateRange}
            onChange={(value) => handleConfigChange('dateRange', value)}
          />

          {reportConfig.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha Inicio"
                type="date"
                value={reportConfig.startDate}
                onChange={(e) => handleConfigChange('startDate', e.target.value)}
              />
              <Input
                label="Fecha Fin"
                type="date"
                value={reportConfig.endDate}
                onChange={(e) => handleConfigChange('endDate', e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Select
            label="Ubicaciones"
            options={locationOptions}
            value={reportConfig.locations}
            onChange={(value) => handleConfigChange('locations', value)}
            multiple
            searchable
            placeholder="Seleccionar ubicaciones"
          />

          <Select
            label="Tipos de Auditoría"
            options={auditTypeOptions}
            value={reportConfig.auditTypes}
            onChange={(value) => handleConfigChange('auditTypes', value)}
            multiple
            searchable
            placeholder="Seleccionar tipos de auditoría"
          />

          <Select
            label="Tipo de Reporte"
            options={reportTypeOptions}
            value={reportConfig.reportType}
            onChange={(value) => handleConfigChange('reportType', value)}
            placeholder="Seleccionar tipo de reporte"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          variant="default"
          onClick={handleGenerateReport}
          iconName="BarChart3"
          iconPosition="left"
          disabled={!reportConfig.dataSource}
        >
          Generar Reporte
        </Button>
      </div>
    </div>
  );
};

export default ReportBuilder;