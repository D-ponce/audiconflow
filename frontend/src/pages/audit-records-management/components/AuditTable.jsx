import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const AuditTable = ({ 
  auditRecords, 
  selectedRecords, 
  onSelectRecord, 
  onSelectAll, 
  onSort, 
  sortConfig, 
  onViewDetails, 
  onEditRecord,
  onProcessData,
  onDeleteRecord,
  userRole
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendiente': { color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg', label: 'Pendiente' },
      'en-progreso': { color: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg', label: 'En Progreso' },
      'completada': { color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg', label: 'Completada' },
      'en-revision': { color: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg', label: 'En Revisión' },
      'pendiente-aprobacion': { color: 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg', label: 'Pendiente Aprobación' },
      'aprobada': { color: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg', label: 'Aprobada' },
      'rechazada': { color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg', label: 'Rechazada' },
      'archivada': { color: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg', label: 'Archivada' }
    };

    const config = statusConfig[status] || statusConfig['en-progreso'];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getComplianceScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSort = (field) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction });
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return 'ArrowUpDown';
    return sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  // Definir permisos por rol según tabla de permisos
  const getPermissions = (role) => {
    switch (role?.toLowerCase()) {
      case 'supervisor':
        return {
          view: true,
          edit: true,
          processData: true,
          delete: true
        };
      case 'administrador':
      case 'admin':
        return {
          view: true,
          edit: false,
          processData: false,
          delete: false
        };
      case 'auditor':
        return {
          view: true,
          edit: true,
          processData: true,
          delete: true
        };
      case 'usuario':
      default:
        return {
          view: true,
          edit: true,
          processData: true,
          delete: true
        };
    }
  };

  const userPermissions = getPermissions(userRole);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="w-12 p-4">
                <Checkbox
                  checked={selectedRecords.length === auditRecords.length && auditRecords.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="text-left p-4 font-semibold text-foreground">
                <button
                  onClick={() => handleSort('auditId')}
                  className="flex items-center space-x-1 hover:text-primary transition-smooth"
                >
                  <span>ID Auditoría</span>
                  <Icon name={getSortIcon('auditId')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-foreground">
                <button
                  onClick={() => handleSort('location')}
                  className="flex items-center space-x-1 hover:text-primary transition-smooth"
                >
                  <span>Ubicación</span>
                  <Icon name={getSortIcon('location')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-foreground">
                <button
                  onClick={() => handleSort('auditor')}
                  className="flex items-center space-x-1 hover:text-primary transition-smooth"
                >
                  <span>Auditor</span>
                  <Icon name={getSortIcon('auditor')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-foreground">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-primary transition-smooth"
                >
                  <span>Estado</span>
                  <Icon name={getSortIcon('status')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-foreground">
                <button
                  onClick={() => handleSort('startDate')}
                  className="flex items-center space-x-1 hover:text-primary transition-smooth"
                >
                  <span>Fecha Inicio</span>
                  <Icon name={getSortIcon('startDate')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-foreground">
                <button
                  onClick={() => handleSort('completionDate')}
                  className="flex items-center space-x-1 hover:text-primary transition-smooth"
                >
                  <span>Fecha Finalización</span>
                  <Icon name={getSortIcon('completionDate')} size={14} />
                </button>
              </th>
              <th className="text-center p-4 font-semibold text-foreground">Acciones</th>
              <th className="text-center p-4 font-semibold text-foreground">Reportes y Análisis</th>
            </tr>
          </thead>
          <tbody>
            {auditRecords.map((record) => (
              <tr
                key={record.id}
                className={`border-t border-border hover:bg-muted/50 transition-smooth cursor-pointer ${
                  selectedRecords.includes(record.id) ? 'bg-accent/10' : ''
                }`}
                onMouseEnter={() => setHoveredRow(record.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onViewDetails(record)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onChange={(e) => onSelectRecord(record.id, e.target.checked)}
                  />
                </td>
                <td className="p-4 font-medium text-primary">{record.auditId}</td>
                <td className="p-4 text-foreground">{record.location}</td>
                <td className="p-4 text-foreground">{record.auditor}</td>
                <td className="p-4">{getStatusBadge(record.status)}</td>
                <td className="p-4 text-muted-foreground">{formatDate(record.startDate)}</td>
                <td className="p-4 text-muted-foreground">{formatDate(record.completionDate)}</td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Eye button clicked for record:', record);
                        onViewDetails(record);
                      }}
                      className="h-8 w-8 hover:bg-yellow-100"
                      title="Ver detalles de la auditoría"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    {userPermissions.edit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRecord(record);
                        }}
                        className="h-8 w-8"
                        title="Editar auditoría"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                    )}
                    {userPermissions.processData && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProcessData(record);
                        }}
                        className="h-8 w-8 hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700"
                        title="Procesar datos"
                      >
                        <Icon name="Zap" size={16} />
                      </Button>
                    )}
                    {userPermissions.delete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRecord(record);
                        }}
                        className="h-8 w-8 hover:bg-red-100 text-red-600 hover:text-red-700"
                        title="Eliminar auditoría"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navegar a resultados de cruce con el auditId string
                        const auditIdToUse = record.auditId || record.id || record._id;
                        console.log('🔍 Navegando a resultados con auditId:', auditIdToUse);
                        window.open(`/audit-results/${auditIdToUse}`, '_blank');
                      }}
                      className="h-8 w-8 hover:bg-green-100 text-green-600 hover:text-green-700"
                      title="Ver resultados de cruce guardados"
                    >
                      <Icon name="GitBranch" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-4 p-4">
        {auditRecords.map((record) => (
          <div
            key={record.id}
            className={`bg-background border border-border rounded-lg p-4 ${
              selectedRecords.includes(record.id) ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedRecords.includes(record.id)}
                  onChange={(e) => onSelectRecord(record.id, e.target.checked)}
                />
                <div>
                  <h4 className="font-semibold text-primary">{record.auditId}</h4>
                  <p className="text-sm text-muted-foreground">{record.location}</p>
                </div>
              </div>
              {getStatusBadge(record.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <span className="text-muted-foreground">Auditor:</span>
                <p className="font-medium">{record.auditor}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Inicio:</span>
                <p>{formatDate(record.startDate)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Finalización:</span>
                <p>{formatDate(record.completionDate)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(record)}
                iconName="Eye"
                iconPosition="left"
              >
                Ver Detalles
              </Button>
              <div className="flex items-center space-x-1">
                {userPermissions.edit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditRecord(record)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Icon name="Edit" size={16} />
                  </Button>
                )}
                {userPermissions.processData && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onProcessData(record)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <Icon name="Zap" size={16} />
                  </Button>
                )}
                {userPermissions.delete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteRecord(record)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/audit-results/${record.auditId}`, '_blank')}
                  className="text-green-600 hover:text-green-700"
                  title="Ver resultados de cruce guardados"
                >
                  <Icon name="GitBranch" size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {auditRecords.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron registros</h3>
          <p className="text-muted-foreground">
            No hay registros de auditoría que coincidan con los filtros aplicados.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuditTable;