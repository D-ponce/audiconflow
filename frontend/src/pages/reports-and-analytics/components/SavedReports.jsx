import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SavedReports = ({ onLoadReport, onShareReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const savedReports = [
    {
      id: 1,
      name: 'Análisis de Cumplimiento Q2 2025',
      category: 'Cumplimiento',
      createdBy: 'María García',
      createdDate: '2025-07-10',
      lastModified: '2025-07-11',
      size: '2.4 MB',
      format: 'PDF',
      shared: true,
      views: 24,
      description: 'Análisis detallado del cumplimiento normativo durante el segundo trimestre'
    },
    {
      id: 2,
      name: 'Rendimiento de Auditores - Junio',
      category: 'Recursos Humanos',
      createdBy: 'Carlos López',
      createdDate: '2025-07-08',
      lastModified: '2025-07-09',
      size: '1.8 MB',
      format: 'Excel',
      shared: false,
      views: 12,
      description: 'Evaluación mensual del desempeño individual de auditores'
    },
    {
      id: 3,
      name: 'Comparativa de Ubicaciones - Semestre 1',
      category: 'Operaciones',
      createdBy: 'Ana Martín',
      createdDate: '2025-07-05',
      lastModified: '2025-07-06',
      size: '3.1 MB',
      format: 'PowerPoint',
      shared: true,
      views: 45,
      description: 'Análisis comparativo entre diferentes ubicaciones de tienda'
    },
    {
      id: 4,
      name: 'Resumen Financiero - Mayo 2025',
      category: 'Financiero',
      createdBy: 'José Ruiz',
      createdDate: '2025-06-30',
      lastModified: '2025-07-01',
      size: '1.2 MB',
      format: 'PDF',
      shared: false,
      views: 8,
      description: 'Resumen ejecutivo de hallazgos financieros y discrepancias'
    },
    {
      id: 5,
      name: 'Análisis de Inventario - Trimestre 2',
      category: 'Inventario',
      createdBy: 'Laura Sánchez',
      createdDate: '2025-06-28',
      lastModified: '2025-06-29',
      size: '2.7 MB',
      format: 'Excel',
      shared: true,
      views: 31,
      description: 'Análisis detallado de discrepancias y tendencias de inventario'
    }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'Cumplimiento', label: 'Cumplimiento' },
    { value: 'Recursos Humanos', label: 'Recursos Humanos' },
    { value: 'Operaciones', label: 'Operaciones' },
    { value: 'Financiero', label: 'Financiero' },
    { value: 'Inventario', label: 'Inventario' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Fecha de creación' },
    { value: 'name', label: 'Nombre' },
    { value: 'views', label: 'Más visto' },
    { value: 'size', label: 'Tamaño' }
  ];

  const filteredReports = savedReports
    .filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'views':
          return b.views - a.views;
        case 'size':
          return parseFloat(b.size) - parseFloat(a.size);
        default:
          return new Date(b.createdDate) - new Date(a.createdDate);
      }
    });

  const getCategoryColor = (category) => {
    const colors = {
      'Cumplimiento': 'bg-emerald-100 text-emerald-700',
      'Recursos Humanos': 'bg-blue-100 text-blue-700',
      'Operaciones': 'bg-purple-100 text-purple-700',
      'Financiero': 'bg-amber-100 text-amber-700',
      'Inventario': 'bg-cyan-100 text-cyan-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getFormatIcon = (format) => {
    const icons = {
      'PDF': 'FileText',
      'Excel': 'FileSpreadsheet',
      'PowerPoint': 'Presentation',
      'CSV': 'Database'
    };
    return icons[format] || 'File';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-lg">
          <Icon name="FolderOpen" size={20} color="var(--color-secondary)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Reportes Guardados</h3>
          <p className="text-sm text-muted-foreground">Acceda a sus reportes anteriores y análisis guardados</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          type="search"
          placeholder="Buscar reportes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-1"
        />
        <Select
          options={categoryOptions}
          value={filterCategory}
          onChange={setFilterCategory}
          placeholder="Filtrar por categoría"
        />
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
          placeholder="Ordenar por"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-muted/50 rounded-lg">
                  <Icon name={getFormatIcon(report.format)} size={20} color="var(--color-muted-foreground)" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{report.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
                    {report.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {report.shared && (
                  <div className="flex items-center justify-center w-6 h-6 bg-success/10 rounded-full">
                    <Icon name="Share2" size={12} color="var(--color-success)" />
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {report.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center space-x-1">
                <Icon name="User" size={12} />
                <span>{report.createdBy}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Calendar" size={12} />
                <span>{report.createdDate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="HardDrive" size={12} />
                <span>{report.size}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Eye" size={12} />
                <span>{report.views} vistas</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoadReport(report)}
                  iconName="Eye"
                >
                  Ver
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShareReport(report)}
                  iconName="Share2"
                >
                  Compartir
                </Button>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" iconName="Download" />
                <Button variant="ghost" size="sm" iconName="Edit" />
                <Button variant="ghost" size="sm" iconName="Trash2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-muted/50 rounded-full mx-auto mb-4">
            <Icon name="Search" size={24} color="var(--color-muted-foreground)" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">No se encontraron reportes</h4>
          <p className="text-muted-foreground">
            {searchTerm || filterCategory !== 'all' ?'Intente ajustar sus filtros de búsqueda' :'Aún no tiene reportes guardados'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedReports;