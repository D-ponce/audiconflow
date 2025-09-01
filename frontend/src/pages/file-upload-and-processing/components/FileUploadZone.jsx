import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadZone = ({ acceptedFormats, maxFileSize, auditData, onUploadSuccess, onFileUploaded, auditId }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [filesInDB, setFilesInDB] = useState([]);
  const [processingResult, setProcessingResult] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ Obtener lista de archivos desde MongoDB
  const fetchFiles = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/files");
      const data = await res.json();
      if (res.ok) setFilesInDB(data);
    } catch (err) {
      console.error("❌ Error al obtener archivos:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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
    uploadFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    uploadFiles(files);
  };

  const openFileDialog = () => fileInputRef.current?.click();

  // ✅ Subir archivos
  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      if (file.size / 1024 / 1024 > maxFileSize) {
        setMessage(`⚠️ El archivo ${file.name} excede el tamaño máximo (${maxFileSize} MB).`);
        return;
      }
      formData.append("files", file);
    });

    // Si hay datos de auditoría, incluirlos en el upload
    const currentAuditId = auditId || auditData?._id || auditData?.auditId;
    if (currentAuditId) {
      formData.append("auditId", currentAuditId);
      if (auditData) {
        formData.append("auditInfo", JSON.stringify({
          auditId: auditData.auditId,
          type: auditData.type,
          location: auditData.location
        }));
      }
    }

    try {
      setUploading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ Error: ${data.error || "No se pudo subir el archivo"}`);
      } else {
        setMessage(`✅ ${data.message || "Archivos subidos correctamente"}`);
        
        // Crear registro de historial para cada archivo subido
        if (data.files && onFileUploaded) {
          data.files.forEach(fileData => {
            onFileUploaded(fileData);
          });
        }
        
        fetchFiles();
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (err) {
      console.error("❌ Error al subir archivos:", err);
      setMessage("❌ Error al conectar con el servidor");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Procesar archivo seleccionado
  const processFile = async (id, filename) => {
    try {
      setMessage(`⚙️ Procesando ${filename}...`);
      setProcessingResult(null);

      const res = await fetch(`http://localhost:5000/api/process/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ Error: ${data.error || "No se pudo procesar el archivo"}`);
      } else {
        setMessage(`✅ Procesamiento completado de ${filename}`);
        setProcessingResult({ filename, ...data });
      }
    } catch (err) {
      console.error("❌ Error al procesar archivo:", err);
      setMessage("❌ Error al conectar con el servidor");
    }
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
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          isDragOver ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon name="Upload" size={32} />
        </div>

        <h3 className="text-lg font-semibold text-foreground">Arrastra y suelta tus archivos aquí</h3>
        <p className="text-sm text-muted-foreground">o haz clic para seleccionar archivos</p>

        <Button
          variant="outline"
          onClick={openFileDialog}
          iconName="FolderOpen"
          iconPosition="left"
          disabled={uploading}
        >
          {uploading ? "Subiendo..." : "Seleccionar Archivos"}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Formatos soportados: {acceptedFormats.join(', ')}</p>
          <p>Tamaño máximo: {maxFileSize}MB por archivo</p>
        </div>

        {message && <p className="mt-2 text-sm text-center text-gray-600">{message}</p>}

        {/* ✅ Archivos en DB */}
        {filesInDB.length > 0 && (
          <div className="mt-6 w-full text-left">
            <h4 className="text-sm font-semibold mb-2">📂 Archivos en la base de datos:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {filesInDB.map((f) => (
                <li key={f.id} className="flex justify-between items-center border-b pb-1">
                  <span>{f.filename}</span>
                  <div className="flex items-center space-x-2">
                    <span>{(f.length / 1024).toFixed(1)} KB</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => processFile(f.id, f.filename)}
                    >
                      Procesar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ✅ Resultado del procesamiento */}
        {processingResult && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/20 text-sm text-left w-full">
            <h4 className="font-semibold mb-2">📊 Resultado del procesamiento:</h4>
            <p><strong>Archivo:</strong> {processingResult.filename}</p>
            <p><strong>Registros importados:</strong> {processingResult.importedRecords}</p>
            <p><strong>Advertencias:</strong> {processingResult.warnings}</p>
            <p><strong>Errores:</strong> {processingResult.errors}</p>
            {processingResult.preview && (
              <div className="mt-3">
                <h5 className="font-semibold">👀 Vista previa de registros:</h5>
                <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                  {JSON.stringify(processingResult.preview, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadZone;
