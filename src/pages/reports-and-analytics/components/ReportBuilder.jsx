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
    { value: 'audits', label: 'Auditorías' },
    { value: 'findings', label: 'Hallazgos' },
    { value: 'evidences', label: 'Evidencias' },
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'last7days', label: 'Últimos 7 días' },
    { value: 'last30days', label: 'Últimos 30 días' },
    { value: 'last90days', label: 'Últimos 90 días' },
    { value: 'custom', label: 'Rango personalizado' }
  ];

  const locationOptions = [
    { value: 'cd_p', label: 'Centro de Distribución P' },
    { value: 'cd_s', label: 'Centro de Distribución S' },
    { value: 'casa_matriz', label: 'Casa Matriz' },
    { value: 'local_s', label: 'Local S' },
    { value: 'tienda_p', label: 'Tienda P' },
  ];

  const auditTypeOptions = [
    { value: 'contabilidad_usuarios', label: 'Auditoría de Usuarios' },
    { value: 'finanzas_precios', label: 'Auditoría de Precios' },
    { value: 'finanzas_stock', label: 'Auditoría Stock' },
    { value: 'operacional_ventas', label: 'Auditoría Ventas' },
    { value: 'finanzas_pagos_proveedores', label: 'Auditoría de Pago Proveedores' },
    { value: 'legal_contratos', label: 'Auditoría de Contratos' }
  ];

  const reportTypeOptions = [
    { value: 'compliance', label: 'Cumplimiento' },
    { value: 'effectiveness', label: 'Efectividad' },
    { value: 'risk', label: 'Riesgo' },
    { value: 'summary', label: 'Resumen Ejecutivo' },
  ];

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateReport = () => {
    onGenerateReport(reportConfig);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
          <Icon name="FileBarChart" size={16} color="var(--color-primary)" />
        </div>
        <h3 className="font-semibold text-foreground">Constructor de Reportes</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Fuente de Datos"
          options={dataSourceOptions}
          value={reportConfig.dataSource}
          onChange={(v) => handleConfigChange('dataSource', v)}
          placeholder="Seleccionar fuente"
        />

        <Select
          label="Rango de Fechas"
          options={dateRangeOptions}
          value={reportConfig.dateRange}
          onChange={(v) => handleConfigChange('dateRange', v)}
          placeholder="Seleccionar rango"
        />
      </div>

      {reportConfig.dateRange === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Input
            type="date"
            label="Inicio"
            value={reportConfig.startDate}
            onChange={(e) => handleConfigChange('startDate', e.target.value)}
          />
          <Input
            type="date"
            label="Término"
            value={reportConfig.endDate}
            onChange={(e) => handleConfigChange('endDate', e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Select
          label="Ubicaciones"
          options={locationOptions}
          value={reportConfig.locations}
          onChange={(v) => handleArrayChange('locations', v)}
          multiple
          searchable
          placeholder="Seleccionar ubicaciones"
        />
        <Select
          label="Tipos de Auditoría"
          options={auditTypeOptions}
          value={reportConfig.auditTypes}
          onChange={(v) => handleArrayChange('auditTypes', v)}
          multiple
          searchable
          placeholder="Seleccionar tipos"
        />
      </div>

      <div className="mt-4">
        <Select
          label="Tipo de Reporte"
          options={reportTypeOptions}
          value={reportConfig.reportType}
          onChange={(v) => handleConfigChange('reportType', v)}
          placeholder="Seleccionar tipo"
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="primary" iconName="FileSpreadsheet" iconPosition="left" onClick={handleGenerateReport}>
          Generar Reporte
        </Button>
      </div>
    </div>
  );
};

export default ReportBuilder;
