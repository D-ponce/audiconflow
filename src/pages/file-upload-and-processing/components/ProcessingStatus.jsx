import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingStatus = ({ 
  isProcessing, 
  processingStep, 
  processingLogs, 
  processingResults,
  onDownloadErrorReport,
  onViewResults 
}) => {
  const processingSteps = [
    { id: 'validation', label: 'Validando archivos', icon: 'FileCheck' },
    { id: 'parsing', label: 'Analizando datos', icon: 'Search' },
    { id: 'importing', label: 'Importando registros', icon: 'Database' },
    { id: 'completed', label: 'Procesamiento completado', icon: 'CheckCircle' }
  ];

  const getStepStatus = (stepId) => {
    const currentIndex = processingSteps.findIndex(step => step.id === processingStep);
    const stepIndex = processingSteps.findIndex(step => step.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (!isProcessing && !processingResults) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Estado del Procesamiento
      </h3>
      
      {/* Processing Steps */}
      <div className="space-y-4 mb-6">
        {processingSteps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div key={step.id} className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'completed' 
                  ? 'bg-success text-white' 
                  : status === 'active' ?'bg-primary text-white' :'bg-muted text-muted-foreground'
              }`}>
                {status === 'active' ? (
                  <Icon name="Loader" size={16} className="animate-spin" />
                ) : (
                  <Icon name={step.icon} size={16} />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  status === 'completed' || status === 'active' 
                    ? 'text-foreground' :'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
              </div>
              
              {status === 'completed' && (
                <Icon name="Check" size={16} className="text-success" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Processing Logs */}
      {processingLogs && processingLogs.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Registro de Actividad
          </h4>
          <div className="bg-muted/30 rounded-lg p-4 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {processingLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2 text-xs">
                  <span className="text-muted-foreground font-mono">
                    {log.timestamp}
                  </span>
                  <span className={`${
                    log.type === 'error' ?'text-error' 
                      : log.type === 'warning' ?'text-warning' :'text-foreground'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Processing Results */}
      {processingResults && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">
            Resumen de Resultados
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="text-sm font-medium text-success">
                  Registros Importados
                </span>
              </div>
              <p className="text-2xl font-bold text-success">
                {processingResults.importedRecords.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="AlertTriangle" size={16} className="text-warning" />
                <span className="text-sm font-medium text-warning">
                  Advertencias
                </span>
              </div>
              <p className="text-2xl font-bold text-warning">
                {processingResults.warnings}
              </p>
            </div>
            
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="XCircle" size={16} className="text-error" />
                <span className="text-sm font-medium text-error">
                  Errores
                </span>
              </div>
              <p className="text-2xl font-bold text-error">
                {processingResults.errors}
              </p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="BarChart3" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Calidad de Datos
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${processingResults.dataQualityScore}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">
                {processingResults.dataQualityScore}%
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              variant="default"
              onClick={onViewResults}
              iconName="Eye"
              iconPosition="left"
            >
              Ver Resultados
            </Button>
            
            {processingResults.errors > 0 && (
              <Button
                variant="outline"
                onClick={onDownloadErrorReport}
                iconName="Download"
                iconPosition="left"
              >
                Descargar Reporte de Errores
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;