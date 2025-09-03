import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AuditFilters = ({ onFilterChange, onSearch, onClearFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedAuditor, setSelectedAuditor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const locationOptions = [
    { value: '', label: 'Todas las ubicaciones' },
    { value: 'casa-matriz', label: 'Casa Matriz' },
    { value: 'centro-distribucion-s', label: 'Centro de distribución S' },
    { value: 'centro-distribucion-p', label: 'Centro de Distribución P' },
    { value: 'locales', label: 'Locales' },
    { value: 'tiendas', label: 'Tiendas' }
  ];

  const auditorOptions = [
    { value: '', label: 'Todos los auditores' },
    { value: 'maria-garcia', label: 'María García' },
    { value: 'carlos-rodriguez', label: 'Carlos Rodríguez' },
    { value: 'ana-martinez', label: 'Ana Martínez' },
    { value: 'david-lopez', label: 'David López' },
    { value: 'laura-sanchez', label: 'Laura Sánchez' }
  ];

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en-progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'revision', label: 'En Revisión' },
    { value: 'archivada', label: 'Archivada' }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
    onFilterChange('location', value);
  };

  const handleAuditorChange = (value) => {
    setSelectedAuditor(value);
    onFilterChange('auditor', value);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    onFilterChange('status', value);
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    onFilterChange('dateRange', newDateRange);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedAuditor('');
    setSelectedStatus('');
    setDateRange({ start: '', end: '' });
    onClearFilters();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Filtros de Búsqueda</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          iconName="X"
          iconPosition="left"
        >
          Limpiar Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search Bar */}
        <div className="xl:col-span-2">
          <Input
            type="search"
            placeholder="Buscar por ID, ubicación o auditor..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Location Filter */}
        <div>
          <Select
            options={locationOptions}
            value={selectedLocation}
            onChange={handleLocationChange}
            placeholder="Ubicación"
          />
        </div>

        {/* Auditor Filter */}
        <div>
          <Select
            options={auditorOptions}
            value={selectedAuditor}
            onChange={handleAuditorChange}
            placeholder="Auditor"
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            options={statusOptions}
            value={selectedStatus}
            onChange={handleStatusChange}
            placeholder="Estado"
          />
        </div>

        {/* Date Range */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground min-w-[40px]">Desde:</span>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              placeholder="Fecha inicio"
              className="flex-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground min-w-[40px]">Hasta:</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              placeholder="Fecha fin"
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditFilters;