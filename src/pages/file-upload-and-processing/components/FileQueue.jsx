import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileQueue = ({ files, onRemoveFile, onClearAll }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'xlsx': case'xls':
        return 'FileSpreadsheet';
      case 'csv':
        return 'FileText';
      case 'pdf':
        return 'FileText';
      default:
        return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'processing':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'error':
        return 'XCircle';
      case 'processing':
        return 'Loader';
      default:
        return 'Clock';
    }
  };

  if (files.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Cola de Archivos ({files.length})
        </h3>
        {files.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            iconName="Trash2"
            iconPosition="left"
          >
            Limpiar Todo
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg"
          >
            <div className="flex-shrink-0">
              <Icon name={getFileIcon(file.name)} size={24} className="text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </div>
              
              {file.progress !== undefined && (
                <div className="w-full bg-muted rounded-full h-2 mb-1">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon
                    name={getStatusIcon(file.status)}
                    size={14}
                    className={`${getStatusColor(file.status)} ${
                      file.status === 'processing' ? 'animate-spin' : ''
                    }`}
                  />
                  <span className={`text-xs ${getStatusColor(file.status)}`}>
                    {file.statusText}
                  </span>
                </div>
                
                {file.progress !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {file.progress}%
                  </span>
                )}
              </div>
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
        ))}
      </div>
    </div>
  );
};

export default FileQueue;