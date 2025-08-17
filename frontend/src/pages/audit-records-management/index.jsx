import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import AuditFilters from './components/AuditFilters';
import AuditTable from './components/AuditTable';
import AuditDetailModal from './components/AuditDetailModal';
import ActionButtons from './components/ActionButtons';
import Pagination from './components/Pagination';

const AuditRecordsManagement = () => {
  const [auditRecords, setAuditRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortConfig, setSortConfig] = useState({ field: 'startDate', direction: 'desc' });
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    auditor: '',
    status: '',
    dateRange: { start: '', end: '' }
  });

  // Mock audit records data
  const mockAuditRecords = [
    {
      id: 1,
      auditId: 'AUD-2025-001',
      location: 'Madrid Centro',
      auditor: 'María García',
      status: 'completada',
      startDate: '2025-07-10T09:00:00',
      completionDate: '2025-07-11T17:30:00',
      complianceScore: 92
    },
    {
      id: 2,
      auditId: 'AUD-2025-002',
      location: 'Barcelona Eixample',
      auditor: 'Carlos Rodríguez',
      status: 'en-progreso',
      startDate: '2025-07-11T08:30:00',
      completionDate: null,
      complianceScore: 0
    },
    {
      id: 3,
      auditId: 'AUD-2025-003',
      location: 'Valencia Centro',
      auditor: 'Ana Martínez',
      status: 'pendiente',
      startDate: '2025-07-15T10:00:00',
      completionDate: null,
      complianceScore: 0
    },
    {
      id: 4,
      auditId: 'AUD-2025-004',
      location: 'Sevilla Triana',
      auditor: 'David López',
      status: 'completada',
      startDate: '2025-07-08T09:15:00',
      completionDate: '2025-07-09T16:45:00',
      complianceScore: 88
    },
    {
      id: 5,
      auditId: 'AUD-2025-005',
      location: 'Bilbao Casco Viejo',
      auditor: 'Laura Sánchez',
      status: 'revision',
      startDate: '2025-07-09T11:00:00',
      completionDate: '2025-07-10T18:20:00',
      complianceScore: 95
    },
    {
      id: 6,
      auditId: 'AUD-2025-006',
      location: 'Madrid Centro',
      auditor: 'María García',
      status: 'archivada',
      startDate: '2025-07-05T08:00:00',
      completionDate: '2025-07-06T17:00:00',
      complianceScore: 85
    },
    {
      id: 7,
      auditId: 'AUD-2025-007',
      location: 'Barcelona Eixample',
      auditor: 'Carlos Rodríguez',
      status: 'completada',
      startDate: '2025-07-07T09:30:00',
      completionDate: '2025-07-08T16:15:00',
      complianceScore: 91
    },
    {
      id: 8,
      auditId: 'AUD-2025-008',
      location: 'Valencia Centro',
      auditor: 'Ana Martínez',
      status: 'en-progreso',
      startDate: '2025-07-12T10:30:00',
      completionDate: null,
      complianceScore: 0
    }
  ];

  useEffect(() => {
    setAuditRecords(mockAuditRecords);
    setFilteredRecords(mockAuditRecords);
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
      filtered = filtered.filter(record => record.location === filters.location);
    }

    // Auditor filter
    if (filters.auditor) {
      filtered = filtered.filter(record => record.auditor === filters.auditor);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
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
    setSelectedAudit(audit);
    setIsDetailModalOpen(true);
  };

  const handleEditRecord = (audit) => {
    console.log('Editar auditoría:', audit.auditId);
    // Implement edit functionality
  };

  const handleDuplicateRecord = (audit) => {
    console.log('Duplicar auditoría:', audit.auditId);
    // Implement duplicate functionality
  };

  const handleArchiveRecord = (audit) => {
    console.log('Archivar auditoría:', audit.auditId);
    // Implement archive functionality
  };

  const handleNewAudit = () => {
    console.log('Crear nueva auditoría');
    // Implement new audit functionality
  };

  const handleExportData = () => {
    console.log('Exportar datos');
    // Implement export functionality
  };

  const handleScheduleAudit = () => {
    console.log('Programar auditoría');
    // Implement schedule functionality
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            onExportData={handleExportData}
            onScheduleAudit={handleScheduleAudit}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
          />

          {/* Audit Table */}
          <AuditTable
            auditRecords={getCurrentPageRecords()}
            selectedRecords={selectedRecords}
            onSelectRecord={handleSelectRecord}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            onViewDetails={handleViewDetails}
            onEditRecord={handleEditRecord}
            onDuplicateRecord={handleDuplicateRecord}
            onArchiveRecord={handleArchiveRecord}
          />

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
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAudit(null);
        }}
      />
    </div>
  );
};

export default AuditRecordsManagement;