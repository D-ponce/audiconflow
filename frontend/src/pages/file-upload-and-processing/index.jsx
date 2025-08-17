import React, { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import FileUploadZone from "./components/FileUploadZone";
import FileQueue from "./components/FileQueue";
import FileValidation from "./components/FileValidation";
import ProcessingStatus from "./components/ProcessingStatus";
import QuickActions from "./components/QuickActions";

const FileUploadAndProcessing = () => {
  const [files, setFiles] = useState([]); // Archivos en MongoDB
  const [selectedFileId, setSelectedFileId] = useState(null);

  // 🔹 Obtener lista de archivos desde backend
  const fetchFiles = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/files");
      const data = await res.json();
      if (res.ok) {
        setFiles(data);
      }
    } catch (err) {
      console.error("❌ Error al cargar archivos:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleRemoveFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFileId === fileId) setSelectedFileId(null);
  };

  const handleClearAll = () => {
    setFiles([]);
    setSelectedFileId(null);
  };

  // ✅ Cuando subo archivo, refresco lista
  const handleUploadSuccess = () => {
    fetchFiles();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 🔹 Page Header */}
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
                  Sube, selecciona y procesa tus archivos de auditoría de forma segura
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="FileCheck" size={16} />
                <span>Formatos soportados: Excel, CSV, PDF</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="HardDrive" size={16} />
                <span>Máximo: 50MB</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} />
                <span>Procesamiento seguro con MongoDB</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 🔹 Left Column - Upload + Lista archivos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subida de archivos */}
              <FileUploadZone
                acceptedFormats={[".xls", ".xlsx", ".csv", ".pdf"]}
                maxFileSize={50}
                onUploadSuccess={handleUploadSuccess}
              />

              {/* Lista de archivos guardados */}
              {files.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Archivos disponibles en base de datos
                  </h3>
                  <ul className="space-y-2">
                    {files.map((f) => (
                      <li
                        key={f.id}
                        className={`p-3 rounded-lg cursor-pointer transition ${
                          selectedFileId === f.id
                            ? "bg-primary text-white"
                            : "bg-muted hover:bg-muted/60"
                        }`}
                        onClick={() => setSelectedFileId(f.id)}
                      >
                        {f.filename} - {(f.length / 1024).toFixed(1)} KB
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validación + Cola de Archivos */}
              {selectedFileId && (
                <>
                  <FileQueue
                    selectedFileId={selectedFileId}
                    onRemoveFile={handleRemoveFile}
                    onClearAll={handleClearAll}
                  />

                  <FileValidation selectedFileId={selectedFileId} />
                </>
              )}
            </div>

            {/* 🔹 Right Column - Procesamiento */}
            <div className="space-y-6">
              {selectedFileId ? (
                <>
                  <ProcessingStatus
                    selectedFileId={selectedFileId}
                    onViewResults={() =>
                      alert("Aquí mostrarías resultados más detallados 🚀")
                    }
                  />

                  <QuickActions
                    onProcessAnother={() => setSelectedFileId(null)}
                    onViewResults={() => alert("Abrir reporte con resultados")}
                    onDownloadReport={() =>
                      alert("Descargando reporte en construcción...")
                    }
                    showViewResults={true}
                    showDownloadReport={true}
                  />
                </>
              ) : (
                <div className="p-6 bg-muted/30 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                  <Icon name="Info" size={20} className="mx-auto mb-2" />
                  Selecciona un archivo de la lista para iniciar el procesamiento
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileUploadAndProcessing;
