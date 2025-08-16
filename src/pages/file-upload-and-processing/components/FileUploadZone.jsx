import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadZone = ({ onFilesSelected, acceptedFormats, maxFileSize }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    onFilesSelected(files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        isDragOver
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex flex-col items-center space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
          isDragOver ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon name="Upload" size={32} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Revisión de usuarios 
          </h3>
          <p className="text-sm text-muted-foreground">
            o haz clic para seleccionar archivos
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={openFileDialog}
          iconName="FolderOpen"
          iconPosition="left"
        >
          Seleccionar Archivos
        </Button>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Formatos soportados: {acceptedFormats.join(', ')}</p>
          <p>Tamaño máximo: {maxFileSize}MB por archivo</p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;