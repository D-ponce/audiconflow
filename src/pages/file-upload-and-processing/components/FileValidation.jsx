import React from 'react';
import Icon from '../../../components/AppIcon';

const FileValidation = ({ validationResults }) => {
  if (!validationResults || validationResults.length === 0) return null;

  const getValidationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      default:
        return 'Info';
    }
  };

  const getValidationColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getValidationBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      case 'error':
        return 'bg-error/10 border-error/20';
      default:
        return 'bg-muted/10 border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Validación de Archivos
      </h3>
      
      <div className="space-y-3">
        {validationResults.map((result, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getValidationBg(result.type)}`}
          >
            <div className="flex items-start space-x-3">
              <Icon
                name={getValidationIcon(result.type)}
                size={20}
                className={`${getValidationColor(result.type)} flex-shrink-0 mt-0.5`}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">
                    {result.fileName}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    result.type === 'success' ?'bg-success/20 text-success'
                      : result.type === 'warning' ?'bg-warning/20 text-warning'
                      : result.type === 'error' ?'bg-error/20 text-error' :'bg-muted/20 text-muted-foreground'
                  }`}>
                    {result.type === 'success' ? 'Válido' : 
                     result.type === 'warning' ? 'Advertencia' : 
                     result.type === 'error' ? 'Error' : 'Info'}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {result.message}
                </p>
                
                {result.details && result.details.length > 0 && (
                  <div className="space-y-1">
                    {result.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-2 text-xs">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span className="text-muted-foreground">{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                    <p className="font-medium text-foreground mb-1">Sugerencias:</p>
                    {result.suggestions.map((suggestion, suggestionIndex) => (
                      <div key={suggestionIndex} className="flex items-center space-x-2">
                        <Icon name="Lightbulb" size={12} className="text-warning" />
                        <span className="text-muted-foreground">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileValidation;