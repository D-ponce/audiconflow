import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: 'audit_completed',
      title: 'Auditoría completada',
      description: 'Tienda Centro Comercial Plaza',
      user: 'María González',
      timestamp: '2025-07-12T10:30:00',
      icon: 'CheckCircle',
      iconColor: 'bg-success'
    },
    {
      id: 2,
      type: 'audit_started',
      title: 'Nueva auditoría iniciada',
      description: 'Sucursal Zona Norte',
      user: 'Carlos Rodríguez',
      timestamp: '2025-07-12T09:15:00',
      icon: 'Play',
      iconColor: 'bg-primary'
    },
    {
      id: 3,
      type: 'report_generated',
      title: 'Reporte generado',
      description: 'Informe mensual de cumplimiento',
      user: 'Ana Martínez',
      timestamp: '2025-07-12T08:45:00',
      icon: 'FileText',
      iconColor: 'bg-accent'
    },
    {
      id: 4,
      type: 'issue_found',
      title: 'Incidencia detectada',
      description: 'Discrepancia en inventario',
      user: 'Luis Fernández',
      timestamp: '2025-07-11T16:20:00',
      icon: 'AlertTriangle',
      iconColor: 'bg-warning'
    },
    {
      id: 5,
      type: 'user_added',
      title: 'Nuevo usuario agregado',
      description: 'Auditor junior incorporado',
      user: 'Sistema',
      timestamp: '2025-07-11T14:10:00',
      icon: 'UserPlus',
      iconColor: 'bg-secondary'
    }
  ];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-minimal">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Actividad Reciente</h3>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          Ver todo
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${activity.iconColor} flex items-center justify-center`}>
              <Icon name={activity.icon} size={16} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-muted-foreground">{activity.user}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;