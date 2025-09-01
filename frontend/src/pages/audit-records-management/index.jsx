import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import AuditFilters from './components/AuditFilters';
import AuditTable from './components/AuditTable';
import AuditDetailModal from './components/AuditDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ActionButtons from './components/ActionButtons';
import Pagination from './components/Pagination';
import AuditService from '../../services/auditService';

const AuditRecordsManagement = () => {
  const navigate = useNavigate();
  const [auditRecords, setAuditRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortConfig, setSortConfig] = useState({ field: 'startDate', direction: 'desc' });
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    auditor: '',
    status: '',
    dateRange: { start: '', end: '' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load audits from database
  const loadAudits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuditService.getAudits();
      
      if (response.success) {
        // Transform data to match the expected format
        const transformedAudits = response.audits.map(audit => ({
          id: audit._id,
          name: audit.name, // Incluir el campo name de la auditoría
          auditId: audit.auditId,
          location: audit.location,
          auditor: audit.auditor,
          // Transformar estados para mapeo consistente con AuditTable
          status: audit.status.toLowerCase().replace(/\s+/g, '-').replace(/ó/g, 'o'),
          originalStatus: audit.status, // Mantener estado original para edición
          startDate: audit.createdAt,
          completionDate: audit.status === 'Completada' ? audit.updatedAt : null,
          complianceScore: audit.completionPercentage || 0,
          type: audit.type,
          priority: audit.priority,
          dueDate: audit.dueDate,
          description: audit.description
        }));
        
        setAuditRecords(transformedAudits);
        setFilteredRecords(transformedAudits);
      } else {
        setError('Error al cargar las auditorías');
      }
    } catch (err) {
      console.error('Error loading audits:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, auditRecords]);

  const applyFilters = () => {
    let filtered = [...auditRecords];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(record =>
        record.auditId.toLowerCase().includes(searchTerm) ||
        record.location.toLowerCase().includes(searchTerm) ||
        record.auditor.toLowerCase().includes(searchTerm)
      );
    }

    // Location filter
    if (filters.location) {
      // Convert filter value back to display format for comparison
      const locationMap = {
        'casa-matriz': 'Casa Matriz',
        'centro-distribucion-s': 'Centro de distribución S',
        'centro-distribucion-p': 'Centro de Distribución P',
        'locales': 'Locales',
        'tiendas': 'Tiendas'
      };
      const locationToMatch = locationMap[filters.location] || filters.location;
      filtered = filtered.filter(record => record.location === locationToMatch);
    }

    // Auditor filter
    if (filters.auditor) {
      // Convert filter value back to display format for comparison
      const auditorMap = {
        'maria-garcia': 'María García',
        'carlos-rodriguez': 'Carlos Rodríguez', 
        'ana-martinez': 'Ana Martínez',
        'david-lopez': 'David López',
        'laura-sanchez': 'Laura Sánchez'
      };
      const auditorToMatch = auditorMap[filters.auditor] || filters.auditor;
      filtered = filtered.filter(record => record.auditor === auditorToMatch);
    }

    // Status filter
    if (filters.status) {
      // Convert filter value back to display format for comparison
      const statusMap = {
        'pendiente': 'pendiente',
        'en-progreso': 'en-progreso', 
        'completada': 'completada',
        'revision': 'en-revisión',
        'archivada': 'archivada'
      };
      const statusToMatch = statusMap[filters.status] || filters.status;
      filtered = filtered.filter(record => record.status === statusToMatch);
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.startDate);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (startDate && endDate) {
          return recordDate >= startDate && recordDate <= endDate;
        } else if (startDate) {
          return recordDate >= startDate;
        } else if (endDate) {
          return recordDate <= endDate;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (sortConfig.field === 'startDate' || sortConfig.field === 'completionDate') {
        const aDate = aValue ? new Date(aValue) : new Date(0);
        const bDate = bValue ? new Date(bValue) : new Date(0);
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      location: '',
      auditor: '',
      status: '',
      dateRange: { start: '', end: '' }
    });
  };

  const handleSelectRecord = (recordId, isSelected) => {
    if (isSelected) {
      setSelectedRecords(prev => [...prev, recordId]);
    } else {
      setSelectedRecords(prev => prev.filter(id => id !== recordId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const currentPageRecords = getCurrentPageRecords().map(record => record.id);
      setSelectedRecords(currentPageRecords);
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
  };

  const handleViewDetails = (audit) => {
    console.log('handleViewDetails called with audit:', audit);
    setSelectedAudit(audit);
    setShowDetailModal(true);
  };

  const handleProcessData = (record) => {
    // Navegar a la página de carga y procesamiento con el ID de la auditoría
    navigate(`/file-upload-and-processing?auditId=${record.auditId}`);
  };

  const handleEditRecord = (record) => {
    // Asegurar que el objeto tenga el _id correcto para MongoDB
    const auditDataWithId = {
      ...record,
      _id: record.id || record._id  // Usar el id transformado como _id para MongoDB
    };
    
    console.log('Enviando a edición:', auditDataWithId);
    
    // Redirigir a la página de edición de auditoría
    navigate('/audit-edit', { 
      state: { 
        auditData: auditDataWithId,
        fromAuditEdit: true 
      } 
    });
  };

  const handleDuplicateRecord = async (audit) => {
    try {
      setLoading(true);
      const duplicatedAudit = {
        ...audit,
        auditId: undefined, // Se generará un nuevo ID
        status: 'Pendiente',
        createdAt: new Date().toISOString(),
        type: audit.type + ' (Copia)',
        description: audit.description + ' - Duplicada'
      };
      
      const response = await AuditService.createAudit(duplicatedAudit);
      if (response.success) {
        await loadAudits(); // Recargar la lista
        // Mostrar mensaje de éxito (podrías usar un toast aquí)
        console.log('Auditoría duplicada exitosamente');
      }
    } catch (error) {
      console.error('Error al duplicar auditoría:', error);
      setError('Error al duplicar la auditoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = (audit) => {
    setAuditToDelete(audit);
    setShowDeleteModal(true);
  };

  const confirmDeleteAudit = async () => {
    if (!auditToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await AuditService.deleteAudit(auditToDelete.id);
      
      if (response.success) {
        await loadAudits(); // Recargar la lista
        setShowDeleteModal(false);
        setAuditToDelete(null);
        // Limpiar selección si la auditoría eliminada estaba seleccionada
        setSelectedRecords(prev => prev.filter(id => id !== auditToDelete.id));
      }
    } catch (error) {
      console.error('Error al eliminar auditoría:', error);
      setError('Error al eliminar la auditoría: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveRecord = async (audit) => {
    try {
      setLoading(true);
      const response = await AuditService.deleteAudit(audit._id);
      
      if (response.success) {
        await loadAudits(); // Recargar la lista
        console.log('Auditoría eliminada exitosamente');
      }
    } catch (error) {
      console.error('Error al eliminar auditoría:', error);
      setError('Error al eliminar la auditoría');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAudit = () => {
    navigate('/dashboard');
  };


  const handleBulkArchive = () => {
    console.log('Archivar seleccionados:', selectedRecords);
    setSelectedRecords([]);
  };

  const handleBulkDelete = () => {
    console.log('Eliminar seleccionados:', selectedRecords);
    setSelectedRecords([]);
  };

  const getCurrentPageRecords = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRecords.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestión de Registros de Auditoría
            </h1>
            <p className="text-muted-foreground">
              Administra y supervisa todos los registros de auditoría de tus ubicaciones retail
            </p>
          </div>

          {/* Filters */}
          <AuditFilters
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
          />

          {/* Action Buttons */}
          <ActionButtons
            selectedCount={selectedRecords.length}
            onNewAudit={handleNewAudit}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
          />

          {/* Loading and Error States */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Cargando auditorías...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-medium">Error al cargar auditorías</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <button 
                    onClick={loadAudits}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && auditRecords.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-foreground mb-2">No hay auditorías registradas</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primera auditoría desde el dashboard
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ir al Dashboard
              </button>
            </div>
          )}

          {/* Audit Table */}
          {!loading && !error && auditRecords.length > 0 && (
            <AuditTable
              auditRecords={getCurrentPageRecords()}
              selectedRecords={selectedRecords}
              onSelectRecord={handleSelectRecord}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              sortConfig={sortConfig}
              onViewDetails={handleViewDetails}
              onEditRecord={handleEditRecord}
              onProcessData={handleProcessData}
              onDeleteRecord={handleDeleteRecord}
            />
          )}

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={filteredRecords.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <AuditDetailModal
        audit={selectedAudit}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAudit(null);
        }}
        onAuditUpdated={loadAudits}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAuditToDelete(null);
        }}
        onConfirm={confirmDeleteAudit}
        auditData={auditToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AuditRecordsManagement;