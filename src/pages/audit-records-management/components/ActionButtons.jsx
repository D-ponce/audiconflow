import React from 'react';

import Button from '../../../components/ui/Button';

const ActionButtons = ({ 
  selectedCount, 
  onNewAudit, 
  onExportData, 
  onScheduleAudit, 
  onBulkArchive, 
  onBulkDelete 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Primary Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="default"
          onClick={onNewAudit}
          iconName="Plus"
          iconPosition="left"
          className="bg-primary hover:bg-primary/90"
        >
          Nueva Auditoría
        </Button>
        <Button
          variant="outline"
          onClick={onExportData}
          iconName="Download"
          iconPosition="left"
        >
          Exportar Datos
        </Button>
        <Button
          variant="outline"
          onClick={onScheduleAudit}
          iconName="Calendar"
          iconPosition="left"
        >
          Programar Auditoría
        </Button>
      </div>

      {/* Bulk Actions - Show when items are selected */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-accent/10 border border-accent/20 rounded-lg">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} elemento{selectedCount > 1 ? 's' : ''} seleccionado{selectedCount > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkArchive}
              iconName="Archive"
              iconPosition="left"
            >
              Archivar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              iconName="Trash2"
              iconPosition="left"
            >
              Eliminar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;