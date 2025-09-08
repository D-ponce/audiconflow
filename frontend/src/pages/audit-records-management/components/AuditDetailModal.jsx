import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import FileUploadSection from './FileUploadSection';
import ProcessedFilesDisplay from './ProcessedFilesDisplay';
import AuditActionHistory from '../../../components/AuditActionHistory';
import AuditReportsSection from '../../../components/AuditReportsSection';
import AuditService from '../../../services/auditService';


const AuditDetailModal = ({ audit, isOpen, onClose, onAuditUpdated }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Inicializar datos del formulario de edición
  useEffect(() => {
    if (audit && showEditModal) {
      setEditFormData({
        name: audit.name || audit.auditId || '',
        type: audit.type || '',
        location: audit.location || '',
        auditor: audit.auditor || '',
        dueDate: audit.dueDate || '',
        status: audit.status || 'Pendiente',
        description: audit.description || '',
        priority: audit.priority || 'Media'
      });
    }
  }, [audit, showEditModal]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      console.log('Submitting edit with audit ID:', audit.id);
      console.log('Form data:', editFormData);
      
      // Usar el _id de MongoDB en lugar del id transformado
      const auditId = audit._id || audit.id;
      const response = await AuditService.updateAudit(auditId, editFormData);
      
      if (response.success) {
        setShowEditModal(false);
        // Llamar callback para actualizar la lista en el componente padre
        if (onAuditUpdated) {
          onAuditUpdated();
        }
        onClose(); // Cerrar el modal principal
        alert('Auditoría actualizada correctamente');
      }
    } catch (error) {
      console.error('Error updating audit:', error);
      alert('Error al actualizar la auditoría: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadAttachedFiles = React.useCallback(async () => {
    if (!audit?.auditId) return;
    
    setLoadingFiles(true);
    try {
      const response = await fetch(`http://localhost:5000/api/files/audit/${audit.auditId}`);
      if (response.ok) {
        const files = await response.json();
        setAttachedFiles(files);
      } else {
        console.error('Error loading files:', response.statusText);
        setAttachedFiles([]);
      }
    } catch (error) {
      console.error('Error loading attached files:', error);
      setAttachedFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }, [audit?.auditId]);

  // Cargar archivos adjuntos cuando se abre el modal
  useEffect(() => {
    if (isOpen && audit?.auditId) {
      loadAttachedFiles();
    }
  }, [isOpen, audit?.auditId, loadAttachedFiles]);

  if (!isOpen || !audit) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendiente': { color: 'bg-warning text-warning-foreground', label: 'Pendiente' },
      'en-progreso': { color: 'bg-accent text-accent-foreground', label: 'En Progreso' },
      'completada': { color: 'bg-success text-success-foreground', label: 'Completada' },
      'revision': { color: 'bg-secondary text-secondary-foreground', label: 'En Revisión' },
      'archivada': { color: 'bg-muted text-muted-foreground', label: 'Archivada' }
    };

    const config = statusConfig[status] || statusConfig['pendiente'];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'FileText';
      case 'xlsx':
      case 'xls':
        return 'FileSpreadsheet';
      case 'zip':
      case 'rar':
        return 'Archive';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'Image';
      default:
        return 'File';
    }
  };

  const downloadFile = async (fileId, filename) => {
    try {
      const response = await fetch(`http://localhost:5000/api/download/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Error downloading file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const mockAttachments = [
    { id: 1, name: 'Informe_Inventario_Q2.pdf', size: '2.4 MB', type: 'pdf' },
    { id: 2, name: 'Fotos_Tienda_Madrid.zip', size: '15.8 MB', type: 'zip' },
    { id: 3, name: 'Checklist_Cumplimiento.xlsx', size: '1.2 MB', type: 'excel' }
  ];

  const generateRealHistory = (audit) => {
    if (!audit) return [];
    
    const history = [];
    let historyId = 1;
    
    // Auditoría creada
    if (audit.startDate) {
      history.push({
        id: historyId++,
        action: 'Auditoría creada',
        user: audit.auditor || 'Sistema',
        date: audit.startDate,
        details: `Auditoría programada para ${audit.location}`
      });
    }
    
    // Si tiene progreso, agregar inicio
    if (audit.complianceScore > 0 || audit.status !== 'pendiente') {
      const startDate = new Date(audit.startDate);
      startDate.setHours(startDate.getHours() + 1); // 1 hora después de creada
      
      history.push({
        id: historyId++,
        action: 'Auditoría iniciada',
        user: audit.auditor || 'Sistema',
        date: startDate.toISOString(),
        details: `Inicio de proceso de auditoría en ${audit.location}`
      });
    }
    
    // Si hay archivos adjuntos, agregar entrada
    if (attachedFiles.length > 0) {
      const attachDate = new Date(audit.startDate);
      attachDate.setHours(attachDate.getHours() + 2); // 2 horas después
      
      history.push({
        id: historyId++,
        action: 'Documentos adjuntados',
        user: audit.auditor || 'Sistema',
        date: attachDate.toISOString(),
        details: `Subida de ${attachedFiles.length} archivo(s) adjunto(s)`
      });
    }
    
    // Si está completada
    if (audit.status === 'completada' && audit.completionDate) {
      history.push({
        id: historyId++,
        action: 'Auditoría completada',
        user: audit.auditor || 'Sistema',
        date: audit.completionDate,
        details: `Finalización exitosa con puntuación de ${audit.complianceScore}%`
      });
    }
    
    // Si está en progreso
    if (audit.status === 'en-progreso') {
      const progressDate = new Date();
      progressDate.setMinutes(progressDate.getMinutes() - 30); // 30 min atrás
      
      history.push({
        id: historyId++,
        action: 'Auditoría en progreso',
        user: audit.auditor || 'Sistema',
        date: progressDate.toISOString(),
        details: `Progreso actual: ${audit.complianceScore}%`
      });
    }
    
    // Ordenar por fecha (más reciente primero)
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const tabs = [
    { id: 'general', label: 'Información General', icon: 'Info' },
    { id: 'upload', label: 'Archivos Adjuntos', icon: 'Paperclip' },
    { id: 'reports', label: 'Reportes y Análisis', icon: 'BarChart3' },
    { id: 'history', label: 'Historial', icon: 'Clock' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Icon name="FileText" size={20} color="white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{audit.auditId}</h2>
              <p className="text-muted-foreground">{audit.location}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(audit.status)}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-smooth ${
                  activeTab === tab.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Auditor Asignado</label>
                    <p className="text-foreground font-medium">{audit.auditor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</label>
                    <p className="text-foreground">{formatDate(audit.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha de Finalización</label>
                    <p className="text-foreground">{formatDate(audit.completionDate)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Auditoría</label>
                    <p className="text-foreground font-medium">Auditoría de Inventario</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duración</label>
                    <p className="text-foreground">2 días, 3 horas</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Próxima Auditoría</label>
                    <p className="text-foreground">15/10/2025</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              <ProcessedFilesDisplay auditId={audit.auditId} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <AuditReportsSection 
                auditId={audit.auditId} 
                isVisible={true}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <AuditActionHistory 
                auditId={audit.auditId} 
                isVisible={true}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button 
            variant="default" 
            iconName="Edit" 
            iconPosition="left"
            onClick={() => setShowEditModal(true)}
          >
            Editar Auditoría
          </Button>
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header del Modal de Edición */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                  <Icon name="Edit" size={20} color="white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Editar Auditoría</h2>
                  <p className="text-muted-foreground">Modifica los datos de la auditoría</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            {/* Formulario de Edición */}
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nombre de Auditoría
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tipo de Auditoría
                    </label>
                    <select
                      value={editFormData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Inventario">Auditoría de Inventario</option>
                      <option value="Financiera">Auditoría Financiera</option>
                      <option value="Operacional">Auditoría Operacional</option>
                      <option value="Cumplimiento">Auditoría de Cumplimiento</option>
                      <option value="Seguridad">Auditoría de Seguridad</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Auditor Asignado
                    </label>
                    <input
                      type="text"
                      value={editFormData.auditor}
                      onChange={(e) => handleInputChange('auditor', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    value={editFormData.dueDate ? editFormData.dueDate.split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Estado
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Activa">Activa</option>
                      <option value="Completada">Completada</option>
                      <option value="En Revisión">En Revisión</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Prioridad
                    </label>
                    <select
                      value={editFormData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Descripción de la auditoría..."
                  />
                </div>
              </div>

              {/* Footer del Modal de Edición */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  variant="default"
                  iconName="Save"
                  iconPosition="left"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDetailModal;