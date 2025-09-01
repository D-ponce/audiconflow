import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, auditData, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Icon name="AlertTriangle" size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h3>
              <p className="text-sm text-gray-500">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que deseas eliminar la siguiente auditoría?
            </p>
            
            {auditData && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">ID:</span>
                    <p className="text-gray-900">{auditData.auditId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Ubicación:</span>
                    <p className="text-gray-900">{auditData.location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Auditor:</span>
                    <p className="text-gray-900">{auditData.auditor}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Estado:</span>
                    <p className="text-gray-900 capitalize">{auditData.status?.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <Icon name="AlertCircle" size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Advertencia:</p>
                  <p>Se eliminarán permanentemente todos los datos asociados incluyendo archivos, reportes y resultados de cruce.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Eliminar Auditoría
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
