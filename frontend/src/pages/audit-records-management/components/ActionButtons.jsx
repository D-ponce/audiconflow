import React from 'react';

import Button from '../../../components/ui/Button';

const ActionButtons = ({ 
  selectedCount, 
  onNewAudit, 
  onBulkArchive, 
  onBulkDelete 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Primary Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onNewAudit}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium text-sm"
        >
          Nueva Auditoría
        </button>
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