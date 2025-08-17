import React from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingDeadlines = () => {
  const deadlines = [
    {
      id: 1,
      title: 'Auditoría Sucursal Centro',
      dueDate: '2025-07-15T09:00:00',
      priority: 'high',
      assignee: 'María González',
      status: 'in_progress'
    },
    {
      id: 2,
      title: 'Reporte Mensual Q2',
      dueDate: '2025-07-18T17:00:00',
      priority: 'medium',
      assignee: 'Carlos Rodríguez',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Revisión Inventario Almacén',
      dueDate: '2025-07-20T14:00:00',
      priority: 'low',
      assignee: 'Ana Martínez',
      status: 'scheduled'
    },
    {
      id: 4,
      title: 'Auditoría Zona Norte',
      dueDate: '2025-07-22T10:30:00',
      priority: 'medium',
      assignee: 'Luis Fernández',
      status: 'scheduled'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'AlertCircle';
      case 'medium': return 'Clock';
      case 'low': return 'CheckCircle';
      default: return 'Circle';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">En Progreso</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">Pendiente</span>;
      case 'scheduled':
        return <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">Programado</span>;
      default:
        return null;
    }
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Mañana';
    if (diffInDays < 7) return `En ${diffInDays} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-minimal">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Próximos Vencimientos</h3>
        <Icon name="Calendar" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {deadlines.map((deadline) => (
          <div key={deadline.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-smooth">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground">{deadline.title}</h4>
              <div className={`flex items-center space-x-1 ${getPriorityColor(deadline.priority)}`}>
                <Icon name={getPriorityIcon(deadline.priority)} size={14} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Asignado a: {deadline.assignee}</p>
                <p className="text-xs font-medium text-foreground">{formatDueDate(deadline.dueDate)}</p>
              </div>
              {getStatusBadge(deadline.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;