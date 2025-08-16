import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const AdvancedFilters = ({ onApplyFilters, onResetFilters }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '', preset: 'last30days' },
    locations: [],
    auditTypes: [],
    auditStatus: [],
    auditors: [],
    complianceScore: { min: 0, max: 100 },
    riskLevel: [],
    departments: [],
    customFields: {}
  });

  const dataSourceOptions = [
    { value: 'all', label: 'Todas las fuentes' },
    { value: 'audits', label: 'Auditorías completadas' },
    { value: 'pending', label: 'Auditorías pendientes' },
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'last7days', label: 'Últimos 7 días' },
    { value: 'last30days', label: 'Últimos 30 días' },
    { value: 'last90days', label: 'Últimos 90 días' },
    { value: 'thisMonth', label: 'Este mes' },
    { value: 'lastMonth', label: 'Mes pasado' },
    { value: 'thisQuarter', label: 'Este trimestre' },
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

  const auditStatusOptions = [
    { value: 'completed', label: 'Completada' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'scheduled', label: 'Programada' }
  ];

  const auditorOptions = [
    { value: 'maria-garcia', label: 'María García' },
    { value: 'carlos-lopez', label: 'Carlos López' },
    { value: 'ana-martin', label: 'Ana Martín' },
    { value: 'jose-ruiz', label: 'José Ruiz' },
    { value: 'laura-sanchez', label: 'Laura Sánchez' },
    { value: 'miguel-torres', label: 'Miguel Torres' }
  ];

  const riskLevelOptions = [
    { value: 'low', label: 'Bajo' },
    { value: 'medium', label: 'Medio' },
    { value: 'high', label: 'Alto' },
    { value: 'critical', label: 'Crítico' }
  ];

  const departmentOptions = [
    { value: 'sales', label: 'Ventas' },
    { value: 'inventory', label: 'Inventario' },
    { value: 'finance', label: 'Finanzas' },
    { value: 'operations', label: 'Operaciones' },
    { value: 'it', label: 'TI' },
    { value: 'hr', label: 'Recursos Humanos' }
  ];

  const handleFilterChange = (category, field, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleArrayFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      dateRange: { start: '', end: '', preset: 'last30days' },
      locations: [],
      auditTypes: [],
      auditStatus: [],
      auditors: [],
      complianceScore: { min: 0, max: 100 },
      riskLevel: [],
      departments: [],
      customFields: {}
    };
    setFilters(resetFilters);
    onResetFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.locations.length > 0) count++;
    if (filters.auditTypes.length > 0) count++;
    if (filters.auditStatus.length > 0) count++;
    if (filters.auditors.length > 0) count++;
    if (filters.riskLevel.length > 0) count++;
    if (filters.departments.length > 0) count++;
    if (filters.complianceScore.min > 0 || filters.complianceScore.max < 100) count++;
    return count;
  };

  const presetDateOptions = dateRangeOptions; // usar el mismo arreglo

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Icon name="Filter" size={16} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Filtros Avanzados</h3>
            {getActiveFiltersCount() > 0 && (
              <p className="text-sm text-muted-foreground">
                {getActiveFiltersCount()} filtro{getActiveFiltersCount() !== 1 ? 's' : ''} activo{getActiveFiltersCount() !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
        >
          {isExpanded ? 'Contraer' : 'Expandir'}
        </Button>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Rango de Fechas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Rango de Fechas</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                options={presetDateOptions}
                value={filters.dateRange.preset}
                onChange={(value) => handleFilterChange('dateRange', 'preset', value)}
                placeholder="Seleccionar rango"
              />
              {filters.dateRange.preset === 'custom' && (
                <>
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleFilterChange('dateRange', 'start', e.target.value)}
                    placeholder="Inicio"
                  />
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleFilterChange('dateRange', 'end', e.target.value)}
                    placeholder="Término"
                  />
                </>
              )}
            </div>
          </div>

          {/* Ubicación y Tipo de Auditoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Ubicaciones"
              options={locationOptions}
              value={filters.locations}
              onChange={(value) => handleArrayFilterChange('locations', value)}
              multiple
              searchable
              placeholder="Seleccionar ubicaciones"
            />
            <Select
              label="Tipos de Auditoría"
              options={auditTypeOptions}
              value={filters.auditTypes}
              onChange={(value) => handleArrayFilterChange('auditTypes', value)}
              multiple
              searchable
              placeholder="Seleccionar tipos"
            />
          </div>

          {/* Estado y Auditores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Estado"
              options={auditStatusOptions}
              value={filters.auditStatus}
              onChange={(value) => handleArrayFilterChange('auditStatus', value)}
              multiple
              placeholder="Seleccionar estados"
            />
            <Select
              label="Auditores"
              options={auditorOptions}
              value={filters.auditors}
              onChange={(value) => handleArrayFilterChange('auditors', value)}
              multiple
              searchable
              placeholder="Seleccionar auditores"
            />
          </div>

          {/* Cumplimiento */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Puntaje de Cumplimiento (%)</label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.complianceScore.min}
                onChange={(e) => handleFilterChange('complianceScore', 'min', parseInt(e.target.value) || 0)}
                placeholder="Mínimo"
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.complianceScore.max}
                onChange={(e) => handleFilterChange('complianceScore', 'max', parseInt(e.target.value) || 100)}
                placeholder="Máximo"
              />
            </div>
          </div>

          {/* Riesgo y Departamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Nivel de Riesgo"
              options={riskLevelOptions}
              value={filters.riskLevel}
              onChange={(value) => handleArrayFilterChange('riskLevel', value)}
              multiple
              placeholder="Seleccionar niveles de riesgo"
            />
            <Select
              label="Departamentos"
              options={departmentOptions}
              value={filters.departments}
              onChange={(value) => handleArrayFilterChange('departments', value)}
              multiple
              placeholder="Seleccionar departamentos"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleResetFilters} iconName="RotateCcw">
              Restablecer
            </Button>
            <Button variant="primary" onClick={handleApplyFilters} iconName="Check" iconPosition="left">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
