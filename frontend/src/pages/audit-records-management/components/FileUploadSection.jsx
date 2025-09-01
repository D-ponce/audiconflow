import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadSection = ({ auditId, onFileUploaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processingFiles, setProcessingFiles] = useState([]);
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
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['.xlsx', '.xls', '.csv', '.pdf'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      return validTypes.includes(fileExtension) && file.size <= 50 * 1024 * 1024; // 50MB max
    });

    if (validFiles.length === 0) {
      alert('Por favor selecciona archivos válidos (Excel, CSV, PDF) menores a 50MB');
      return;
    }

    setUploading(true);
    
    for (const file of validFiles) {
      try {
        await uploadFile(file);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    setUploading(false);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('auditId', auditId);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        const newFile = {
          id: result.fileId,
          name: file.name,
          size: formatFileSize(file.size),
          type: getFileType(file.name),
          uploadDate: new Date().toISOString(),
          processed: false
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
        
        if (onFileUploaded) {
          onFileUploaded(newFile);
        }

        // Show success notification
        showNotification(`Archivo ${file.name} subido exitosamente`, 'success');
        
      } else {
        throw new Error(result.message || 'Error al subir archivo');
      }
    } catch (error) {
      showNotification(`Error al subir ${file.name}: ${error.message}`, 'error');
    }
  };

  const processFile = async (fileId, fileName) => {
    setProcessingFiles(prev => [...prev, fileId]);
    
    try {
      const response = await fetch(`http://localhost:5000/api/process/${fileId}`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId ? { ...file, processed: true, records: result.totalRows } : file
          )
        );
        showNotification(`Archivo ${fileName} procesado exitosamente`, 'success');
      } else {
        throw new Error(result.message || 'Error al procesar archivo');
      }
    } catch (error) {
      showNotification(`Error al procesar ${fileName}: ${error.message}`, 'error');
    } finally {
      setProcessingFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const crossCheckFiles = async () => {
    if (uploadedFiles.length < 2) {
      showNotification('Necesitas al menos 2 archivos para hacer cruce de datos', 'warning');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/cross-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auditId: auditId,
          files: uploadedFiles.map(f => f.id)
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification('Cruce de datos completado exitosamente', 'success');
        // You can add logic here to show results or download report
      } else {
        throw new Error(result.message || 'Error en cruce de datos');
      }
    } catch (error) {
      showNotification(`Error en cruce de datos: ${error.message}`, 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return 'excel';
      case 'csv':
        return 'csv';
      case 'pdf':
        return 'pdf';
      default:
        return 'file';
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'excel':
        return 'FileSpreadsheet';
      case 'csv':
        return 'FileText';
      case 'pdf':
        return 'FileText';
      default:
        return 'File';
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-yellow-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`;
    notification.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Carga y Procesamiento de Archivos</h3>
          <div className="text-sm text-muted-foreground">
            Auditoría: {auditId}
          </div>
        </div>
        
        <div className="mb-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>📄 Formatos soportados: Excel, CSV, PDF</span>
            <span>📦 Máximo: 50MB</span>
            <span>🔒 Procesamiento seguro con MongoDB</span>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Upload" size={32} className="text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-foreground mb-2">
                Arrastra y suelta tus archivos aquí
              </h4>
              <p className="text-muted-foreground mb-4">
                o haz clic para seleccionar archivos
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-primary hover:bg-primary/90"
            >
              <Icon name="FolderOpen" size={16} className="mr-2" />
              Seleccionar Archivos
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="mt-4 text-xs text-muted-foreground">
          Formatos soportados: .xlsx, .xls, .csv, .pdf | Tamaño máximo: 50MB por archivo
        </div>
      </div>

      {/* Processing Status */}
      {uploadedFiles.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">Estado del Procesamiento</h4>
            <div className="text-sm text-muted-foreground">
              Registros importados: {uploadedFiles.reduce((sum, file) => sum + (file.records || 0), 0)}
            </div>
          </div>
          
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={getFileIcon(file.type)} size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.processed ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      ✅ Procesado ({file.records} registros)
                    </span>
                  ) : processingFiles.includes(file.id) ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      🔄 Procesando...
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => processFile(file.id, file.name)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Procesar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {uploadedFiles.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h4>
          <div className="flex space-x-3">
            <Button
              onClick={crossCheckFiles}
              disabled={uploadedFiles.length < 2}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Icon name="GitCompare" size={16} className="mr-2" />
              Procesar Otro Archivo
            </Button>
            <Button
              onClick={crossCheckFiles}
              disabled={uploadedFiles.length < 2}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Icon name="Shuffle" size={16} className="mr-2" />
              Cruce de Información
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
