import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const FileValidation = ({ selectedFileId }) => {
  const [validationResults, setValidationResults] = useState([]);

  useEffect(() => {
    if (!selectedFileId) return;

    const validateFile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/validate/${selectedFileId}`);
        const data = await res.json();
        setValidationResults(data.results);
      } catch (err) {
        console.error("❌ Error en validación:", err);
      }
    };

    validateFile();
  }, [selectedFileId]);

  if (!validationResults || validationResults.length === 0) return null;

  const getValidationIcon = (type) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      default: return 'Info';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Validación de Archivos
      </h3>
      <div className="space-y-3">
        {validationResults.map((result, index) => (
          <div key={index} className="border rounded-lg p-4 bg-muted/10">
            <div className="flex items-start space-x-3">
              <Icon name={getValidationIcon(result.type)} size={20} />
              <div>
                <p className="text-sm font-medium">{result.fileName}</p>
                <p className="text-xs text-muted-foreground">{result.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileValidation;
