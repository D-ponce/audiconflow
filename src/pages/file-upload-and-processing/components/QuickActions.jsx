import React from 'react';
import Button from '../../../components/ui/Button';

const QuickActions = ({ 
  onProcessAnother, 
  onViewResults, 
  onDownloadReport,
  showViewResults = false,
  showDownloadReport = false 
}) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Acciones Rápidas
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          variant="default"
          onClick={onProcessAnother}
          iconName="Plus"
          iconPosition="left"
          fullWidth
        >
          Procesar Otro Archivo
        </Button>
        
        {showViewResults && (
          <Button
            variant="outline"
            onClick={onViewResults}
            iconName="Eye"
            iconPosition="left"
            fullWidth
          >
            Ver Resultados
          </Button>
        )}
        
        {showDownloadReport && (
          <Button
            variant="secondary"
            onClick={onDownloadReport}
            iconName="Download"
            iconPosition="left"
            fullWidth
          >
            Descargar Reporte
          </Button>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Consejos para un mejor procesamiento:</p>
            <ul className="space-y-1">
              <li>• Asegúrate de que los archivos tengan el formato correcto</li>
              <li>• Verifica que las columnas coincidan con el esquema esperado</li>
              <li>• Revisa los datos antes de cargar archivos grandes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;