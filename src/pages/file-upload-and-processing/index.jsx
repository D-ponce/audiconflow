import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import FileUploadZone from './components/FileUploadZone';
import FileQueue from './components/FileQueue';
import FileValidation from './components/FileValidation';
import ProcessingStatus from './components/ProcessingStatus';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';

const FileUploadAndProcessing = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingLogs, setProcessingLogs] = useState([]);
  const [processingResults, setProcessingResults] = useState(null);

  // Configuration
  const acceptedFormats = ['.xlsx', '.xls', '.csv', '.pdf'];
  const maxFileSize = 50; // MB

  // Mock data for demonstration
  const mockProcessingLogs = [
    { timestamp: '05:55:10', type: 'info', message: 'Iniciando validación de archivos...' },
    { timestamp: '05:55:12', type: 'info', message: 'Archivo audit_data.xlsx validado correctamente' },
    { timestamp: '05:55:15', type: 'warning', message: 'Se encontraron 3 registros con datos faltantes' },
    { timestamp: '05:55:18', type: 'info', message: 'Procesando 1,247 registros de auditoría' },
    { timestamp: '05:55:22', type: 'info', message: 'Importación completada exitosamente' }
  ];

  const mockProcessingResults = {
    importedRecords: 1244,
    warnings: 3,
    errors: 0,
    dataQualityScore: 97
  };

  const validateFile = (file) => {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`El archivo excede el tamaño máximo de ${maxFileSize}MB`);
    }

    // Check file format
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFormats.includes(extension)) {
      errors.push('Formato de archivo no soportado');
      suggestions.push('Use archivos Excel (.xlsx, .xls), CSV (.csv) o PDF (.pdf)');
    }

    // Mock additional validations
    if (file.name.includes('test')) {
      warnings.push('El archivo parece ser de prueba');
    }

    if (file.size < 1024) {
      warnings.push('El archivo es muy pequeño, verifique que contenga datos');
    }

    return {
      fileName: file.name,
      type: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'success',
      message: errors.length > 0 
        ? 'El archivo tiene errores que deben corregirse'
        : warnings.length > 0 
        ? 'El archivo es válido pero tiene advertencias'
        : 'El archivo es válido y está listo para procesar',
      details: [...errors, ...warnings],
      suggestions
    };
  };

  const handleFilesSelected = useCallback((selectedFiles) => {
    const newFiles = selectedFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      file: file,
      status: 'pending',
      statusText: 'En cola',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Validate files
    const validations = selectedFiles.map(validateFile);
    setValidationResults(prev => [...prev, ...validations]);
  }, []);

  const handleRemoveFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setValidationResults(prev => prev.filter((_, index) => {
      const fileIndex = files.findIndex(file => file.id === fileId);
      return index !== fileIndex;
    }));
  }, [files]);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setValidationResults([]);
    setProcessingResults(null);
    setProcessingLogs([]);
  }, []);

  const simulateProcessing = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingLogs([]);
    setProcessingResults(null);

    const steps = ['validation', 'parsing', 'importing', 'completed'];
    
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      
      // Update file progress
      setFiles(prev => prev.map(file => ({
        ...file,
        status: i === steps.length - 1 ? 'completed' : 'processing',
        statusText: i === steps.length - 1 ? 'Completado' : 'Procesando...',
        progress: Math.min(100, (i + 1) * 25)
      })));

      // Add logs progressively
      setProcessingLogs(prev => [
        ...prev,
        ...mockProcessingLogs.slice(0, i + 1)
      ]);

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setProcessingResults(mockProcessingResults);
    setIsProcessing(false);
  }, [files]);

  const handleProcessAnother = () => {
    setFiles([]);
    setValidationResults([]);
    setProcessingResults(null);
    setProcessingLogs([]);
    setIsProcessing(false);
    setProcessingStep('');
  };

  const handleViewResults = () => {
    navigate('/reports-and-analytics');
  };

  const handleDownloadReport = () => {
    // Mock download functionality
    const blob = new Blob(['Reporte de procesamiento de archivos\n\nRegistros importados: 1,244\nAdvertencias: 3\nErrores: 0'], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_procesamiento.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadErrorReport = () => {
    // Mock error report download
    const blob = new Blob(['Reporte de errores\n\nNo se encontraron errores en el procesamiento.'], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_errores.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasValidFiles = validationResults.some(result => result.type !== 'error');
  const canProcess = files.length > 0 && hasValidFiles && !isProcessing;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Upload" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Carga y Procesamiento de Archivos
                </h1>
                <p className="text-muted-foreground">
                  Sube y procesa tus archivos de auditoría de forma rápida y segura
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="FileCheck" size={16} />
                <span>Formatos: Excel, CSV, PDF</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="HardDrive" size={16} />
                <span>Máximo: {maxFileSize}MB por archivo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} />
                <span>Procesamiento seguro</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload and Queue */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Upload Zone */}
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                acceptedFormats={acceptedFormats}
                maxFileSize={maxFileSize}
              />

              {/* File Queue */}
              <FileQueue
                files={files}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
              />

              {/* File Validation */}
              <FileValidation validationResults={validationResults} />

              {/* Process Button */}
              {files.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={simulateProcessing}
                    disabled={!canProcess}
                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                      canProcess
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <Icon name="Loader" size={20} className="animate-spin" />
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Icon name="Play" size={20} />
                        <span>Iniciar Procesamiento</span>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Status and Actions */}
            <div className="space-y-6">
              {/* Processing Status */}
              <ProcessingStatus
                isProcessing={isProcessing}
                processingStep={processingStep}
                processingLogs={processingLogs}
                processingResults={processingResults}
                onDownloadErrorReport={handleDownloadErrorReport}
                onViewResults={handleViewResults}
              />

              {/* Quick Actions */}
              <QuickActions
                onProcessAnother={handleProcessAnother}
                onViewResults={handleViewResults}
                onDownloadReport={handleDownloadReport}
                showViewResults={!!processingResults}
                showDownloadReport={!!processingResults}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileUploadAndProcessing;