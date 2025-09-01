import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import FileUploadZone from "./components/FileUploadZone";
import FileQueue from "./components/FileQueue";
import FileValidation from "./components/FileValidation";
import ProcessingStatus from "./components/ProcessingStatus";
import QuickActions from "./components/QuickActions";
import UploadHistory from "./components/UploadHistory";
import fileUploadHistoryService from "../../services/fileUploadHistoryService";

const FileUploadAndProcessing = () => {
  const location = useLocation();
  const [files, setFiles] = useState([]); // Archivos en MongoDB
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [currentAuditId, setCurrentAuditId] = useState(null);
  
  // Obtener datos de la auditoría si viene desde edición o URL params
  const auditData = location.state?.auditData;
  const fromAuditEdit = location.state?.fromAuditEdit;
  
  // Obtener auditId desde URL params o state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const auditIdFromUrl = urlParams.get('auditId');
    
    if (auditIdFromUrl) {
      setCurrentAuditId(auditIdFromUrl);
      localStorage.setItem('currentAuditId', auditIdFromUrl);
    } else if (auditData?._id) {
      setCurrentAuditId(auditData._id);
      localStorage.setItem('currentAuditId', auditData._id);
    } else if (auditData?.auditId) {
      setCurrentAuditId(auditData.auditId);
      localStorage.setItem('currentAuditId', auditData.auditId);
    }
  }, [location, auditData]);

  // 🔹 Obtener lista de archivos desde backend
  const fetchFiles = async () => {
    try {
      let url = "http://localhost:5000/api/files";
      
      // Si hay una auditoría activa, filtrar archivos por auditoría
      if (currentAuditId) {
        url += `?auditId=${currentAuditId}`;
      } else if (fromAuditEdit && auditData) {
        url += `?auditId=${auditData._id}`;
      }
      
      const res = await fetch(url);
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
  }, [currentAuditId]);

  const handleRemoveFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFileId === fileId) setSelectedFileId(null);
  };

  const handleClearAll = () => {
    setFiles([]);
    setSelectedFileId(null);
  };

  // Función para crear registro de historial al cargar archivo
  const createUploadHistory = async (fileData) => {
    if (!currentAuditId) return;

    try {
      const uploadRecord = {
        auditId: currentAuditId,
        fileName: fileData.filename || fileData.name,
        originalName: fileData.originalname || fileData.name,
        fileSize: fileData.size || 0,
        fileType: fileData.mimetype || fileData.type || 'unknown',
        uploadedBy: localStorage.getItem('currentUser') || 'Usuario',
        uploadPath: fileData.path || '',
        metadata: {
          encoding: fileData.encoding,
          mimetype: fileData.mimetype,
          destination: fileData.destination,
          fieldname: fileData.fieldname
        }
      };

      await fileUploadHistoryService.createUploadRecord(uploadRecord);
    } catch (error) {
      console.error('Error al crear registro de historial:', error);
    }
  };

  // ✅ Cuando subo archivo, refresco lista
  const handleUploadSuccess = () => {
    fetchFiles();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 🔹 Page Header */}
          <div className="mb-8">
            {/* Mostrar información de la auditoría si viene desde edición */}
            {fromAuditEdit && auditData && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Icon name="FileText" size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-blue-900">
                      Auditoría: {auditData.auditId} - {auditData.type}
                    </h2>
                    <p className="text-blue-700 text-sm">
                      Ubicación: {auditData.location} | Auditor: {auditData.auditor}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Upload" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Carga y Procesamiento de Archivos
                </h1>
                <p className="text-muted-foreground">
                  {fromAuditEdit 
                    ? `Sube archivos específicos para la auditoría ${auditData?.auditId}`
                    : "Sube, selecciona y procesa tus archivos de auditoría de forma segura"
                  }
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
                acceptedFormats={[".xlsx", ".xls", ".csv", ".pdf"]}
                maxFileSize={50 * 1024 * 1024} // 50MB
                onUploadSuccess={handleUploadSuccess}
                auditData={fromAuditEdit ? auditData : null}
              />

              {/* Lista de archivos guardados */}
              {files.length > 0 && (
                <div className="card-modern card-hover p-6">
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
            </div>

            {/* Columna lateral - Acciones rápidas e historial */}
            <div className="lg:col-span-1 space-y-6">
              <QuickActions />
              <UploadHistory 
                auditId={currentAuditId} 
                onRefresh={fetchFiles}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileUploadAndProcessing;
