import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import reportService from '../../../services/reportService';

const SavedReports = ({ onLoadReport, onShareReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar reportes desde la API
  useEffect(() => {
    loadReports();
  }, [filterCategory]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = { category: filterCategory };
      const data = await reportService.getAllReports(filters);
      setReports(data);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError('Error al cargar los reportes. Verifique que el backend esté funcionando.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'Cumplimiento', label: 'Cumplimiento' },
    { value: 'Recursos Humanos', label: 'Recursos Humanos' },
    { value: 'Operaciones', label: 'Operaciones' },
    { value: 'Financiero', label: 'Financiero' },
    { value: 'Inventario', label: 'Inventario' },
    { value: 'Cruce de Datos', label: 'Cruce de Datos' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Fecha de creación' },
    { value: 'name', label: 'Nombre' },
    { value: 'views', label: 'Más visto' },
    { value: 'size', label: 'Tamaño' }
  ];

  const filteredReports = reports
    .filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
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
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este reporte?')) {
      try {
        await reportService.deleteReport(reportId);
        await loadReports(); // Recargar la lista
      } catch (err) {
        console.error('Error al eliminar reporte:', err);
        alert('Error al eliminar el reporte');
      }
    }
  };

  const handleViewReport = async (report) => {
    try {
      // Incrementar vistas al obtener el reporte
      await reportService.getReportById(report._id);
      if (onLoadReport) {
        onLoadReport(report);
      }
    } catch (err) {
      console.error('Error al cargar reporte:', err);
    }
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-muted/50 rounded-full mx-auto mb-4">
            <Icon name="Loader2" size={24} color="var(--color-muted-foreground)" className="animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando reportes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4">
            <Icon name="AlertCircle" size={24} color="var(--color-destructive)" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">Error al cargar reportes</h4>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadReports} variant="outline">
            Reintentar
          </Button>
        </div>
      )}

      {/* Reports List */}
      {!loading && !error && (
        <div className="space-y-3">
        {filteredReports.map((report) => (
          <div key={report._id} className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between">
              {/* Left section - Report info */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-muted/50 rounded-lg">
                    <Icon name={reportService.getFormatIcon(report.format)} size={16} color="var(--color-muted-foreground)" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{report.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${reportService.getCategoryColor(report.category)}`}>
                        {report.category}
                      </span>
                      {report.shared && (
                        <span className="text-xs text-success font-medium">Activo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle section - Stats */}
              <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="Users" size={12} />
                  <span>{report.metadata?.recipients || 3} destinatarios</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Send" size={12} />
                  <span>Último envío: {reportService.formatDate(report.updatedAt || report.createdAt)}</span>
                </div>
              </div>

              {/* Right section - Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewReport(report)}
                  iconName="Edit"
                  className="text-xs"
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShareReport && onShareReport(report)}
                  iconName="Pause"
                  className="text-xs"
                >
                  Pausar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  iconName="Trash2" 
                  onClick={() => handleDeleteReport(report._id)}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

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