import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileQueue = ({ selectedFileId, onRemoveFile, onClearAll }) => {
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!selectedFileId) return;

    const fetchFile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/files/${selectedFileId}`);
        const data = await res.json();
        setFile({
          id: data.id,
          name: data.filename,
          size: data.length,
          status: 'completed',
          statusText: 'Archivo listo para procesar',
        });
      } catch (err) {
        console.error("❌ Error obteniendo archivo desde backend:", err);
      }
    };

    fetchFile();
  }, [selectedFileId]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return 'FileSpreadsheet';
      case 'csv':
        return 'FileText';
      case 'pdf':
        return 'FileText';
      default:
        return 'File';
    }
  };

  if (!file) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Cola de Archivos (1)
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          iconName="Trash2"
          iconPosition="left"
        >
          Limpiar
        </Button>
      </div>

      <div className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
        <Icon name={getFileIcon(file.name)} size={24} className="text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveFile(file.id)}
          className="flex-shrink-0"
        >
          <Icon name="X" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default FileQueue;
