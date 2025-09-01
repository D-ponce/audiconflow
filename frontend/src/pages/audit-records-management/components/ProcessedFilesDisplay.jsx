import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessedFilesDisplay = ({ auditId }) => {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [processingResults, setProcessingResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAllFiles();
  }, []);

  const loadAllFiles = async () => {
    setLoading(true);
    try {
      console.log('🔍 Cargando archivos desde /api/files...');
      const response = await fetch('http://localhost:5000/api/files');
      if (response.ok) {
        const files = await response.json();
        console.log('📁 Archivos obtenidos:', files);
        setAllFiles(files);
      } else {
        console.error('❌ Error loading files:', response.statusText);
        setAllFiles([]);
      }
    } catch (error) {
      console.error('❌ Error loading files:', error);
      setAllFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (fileId, filename) => {
    setIsProcessing(true);
    setSelectedFileId(fileId);
    setMessage(`⚙️ Procesando ${filename}...`);
    setProcessingResults(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/process/${fileId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProcessingResults(data);
        setMessage(`✅ Procesamiento completado de ${filename}`);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Error: ${errorData.error || "No se pudo procesar el archivo"}`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setMessage("❌ Error al conectar con el servidor");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Cargando archivos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de estado */}
      {message && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      )}

      {/* Archivos en la base de datos */}
      {allFiles.length > 0 ? (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              📂 Archivos en la base de datos:
            </h3>
          </div>
          
          <div className="space-y-2">
            {allFiles.map((file) => (
              <div 
                key={file.id} 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedFileId === file.id 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedFileId(file.id)}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={getFileIcon(file.filename)} size={20} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-foreground">{file.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.length)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    processFile(file.id, file.filename);
                  }}
                  disabled={isProcessing && selectedFileId === file.id}
                  className="bg-purple-500 text-white border-purple-500 hover:bg-purple-600"
                >
                  {isProcessing && selectedFileId === file.id ? (
                    <>
                      <Icon name="Loader" size={16} className="animate-spin mr-1" />
                      Procesando...
                    </>
                  ) : (
                    'Procesar'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : !loading ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="FileX" size={32} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">No hay archivos en la base de datos</p>
          <p className="text-sm text-muted-foreground">
            Los archivos aparecerán aquí una vez que sean subidos
          </p>
        </div>
      ) : null}

      {/* Resultados del procesamiento */}
      {processingResults && selectedFileId && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Estado del Procesamiento
          </h3>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="FileText" size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Registros Importados</p>
                  <p className="text-xl font-bold text-blue-800">{processingResults.totalRows || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600">Advertencias</p>
                  <p className="text-xl font-bold text-yellow-800">{processingResults.warnings || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="XCircle" size={20} className="text-red-600" />
                <div>
                  <p className="text-sm text-red-600">Errores</p>
                  <p className="text-xl font-bold text-red-800">{processingResults.errors || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla con los datos */}
          {processingResults.rows && processingResults.rows.length > 0 && (
            <div className="overflow-x-auto max-h-96 border border-border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {Object.keys(processingResults.rows[0] || {}).map((col, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-left font-medium text-foreground border-b"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processingResults.rows.slice(0, 100).map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      {Object.values(row).map((val, i) => (
                        <td
                          key={i}
                          className="px-4 py-2 border-b text-muted-foreground"
                        >
                          {val !== undefined && val !== null ? val.toString() : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {processingResults.rows.length > 100 && (
                <div className="p-3 text-center text-sm text-muted-foreground bg-muted/30">
                  Mostrando los primeros 100 registros de {processingResults.rows.length} totales
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {allFiles.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="FileX" size={32} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">No hay archivos en la base de datos</p>
          <p className="text-sm text-muted-foreground">
            Los archivos aparecerán aquí una vez que sean subidos
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessedFilesDisplay;
