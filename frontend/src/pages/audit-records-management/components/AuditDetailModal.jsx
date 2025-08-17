import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const AuditDetailModal = ({ audit, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');

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

  const mockAttachments = [
    { id: 1, name: 'Informe_Inventario_Q2.pdf', size: '2.4 MB', type: 'pdf' },
    { id: 2, name: 'Fotos_Tienda_Madrid.zip', size: '15.8 MB', type: 'zip' },
    { id: 3, name: 'Checklist_Cumplimiento.xlsx', size: '1.2 MB', type: 'excel' }
  ];

  const mockHistory = [
    {
      id: 1,
      action: 'Auditoría creada',
      user: 'María García',
      date: '2025-07-10T09:00:00',
      details: 'Auditoría programada para Madrid Centro'
    },
    {
      id: 2,
      action: 'Auditoría iniciada',
      user: 'María García',
      date: '2025-07-10T14:30:00',
      details: 'Inicio de proceso de auditoría en tienda'
    },
    {
      id: 3,
      action: 'Documentos adjuntados',
      user: 'María García',
      date: '2025-07-11T11:15:00',
      details: 'Subida de fotos y checklist de cumplimiento'
    },
    {
      id: 4,
      action: 'Auditoría completada',
      user: 'María García',
      date: '2025-07-11T17:45:00',
      details: 'Finalización exitosa con puntuación de 92%'
    }
  ];

  const tabs = [
    { id: 'general', label: 'Información General', icon: 'Info' },
    { id: 'attachments', label: 'Archivos Adjuntos', icon: 'Paperclip' },
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
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Puntuación de Cumplimiento</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-success">{audit.complianceScore}%</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full transition-all duration-300"
                          style={{ width: `${audit.complianceScore}%` }}
                        />
                      </div>
                    </div>
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
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
                    <p className="text-foreground">
                      Auditoría completada satisfactoriamente. Se identificaron algunas discrepancias menores en el inventario que fueron corregidas durante el proceso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Resultados por Categoría</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Inventario</span>
                      <span className="text-lg font-bold text-success">95%</span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Seguridad</span>
                      <span className="text-lg font-bold text-warning">88%</span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Cumplimiento</span>
                      <span className="text-lg font-bold text-success">93%</span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '93%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Archivos Adjuntos</h3>
                <Button variant="outline" size="sm" iconName="Upload" iconPosition="left">
                  Subir Archivo
                </Button>
              </div>
              <div className="space-y-3">
                {mockAttachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                        <Icon name="File" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Icon name="Download" size={16} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon name="Eye" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Historial de Cambios</h3>
              <div className="space-y-4">
                {mockHistory.map((entry, index) => (
                  <div key={entry.id} className="flex space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
                        <Icon name="Clock" size={14} color="white" />
                      </div>
                      {index < mockHistory.length - 1 && (
                        <div className="w-px h-12 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-foreground">{entry.action}</h4>
                        <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">Por: {entry.user}</p>
                      <p className="text-sm text-foreground">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="default" iconName="Edit" iconPosition="left">
            Editar Auditoría
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditDetailModal;