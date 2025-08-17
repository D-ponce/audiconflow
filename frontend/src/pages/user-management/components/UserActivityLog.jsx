import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const UserActivityLog = () => {
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  const userOptions = [
    { value: 'all', label: 'Todos los usuarios' },
    { value: '1', label: 'María González' },
    { value: '2', label: 'Carlos Rodríguez' },
    { value: '3', label: 'Ana Martínez' },
    { value: '4', label: 'Luis Fernández' },
    { value: '5', label: 'Elena Sánchez' }
  ];

  const activityOptions = [
    { value: 'all', label: 'Todas las actividades' },
    { value: 'login', label: 'Inicios de sesión' },
    { value: 'logout', label: 'Cierres de sesión' },
    { value: 'audit_create', label: 'Auditorías creadas' },
    { value: 'audit_edit', label: 'Auditorías editadas' },
    { value: 'report_generate', label: 'Reportes generados' },
    { value: 'file_upload', label: 'Archivos subidos' },
    { value: 'permission_change', label: 'Cambios de permisos' },
    { value: 'failed_login', label: 'Intentos fallidos' }
  ];

  const timeRangeOptions = [
    { value: '1d', label: 'Último día' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' }
  ];

  const activityLogs = [
    {
      id: 1,
      user: 'María González',
      activity: 'login',
      description: 'Inicio de sesión exitoso',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      ip: '192.168.1.100',
      device: 'Chrome en Windows',
      status: 'success'
    },
    {
      id: 2,
      user: 'Carlos Rodríguez',
      activity: 'audit_create',
      description: 'Creó auditoría "Inventario Q4 2024"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      ip: '192.168.1.101',
      device: 'Firefox en macOS',
      status: 'success'
    },
    {
      id: 3,
      user: 'Ana Martínez',
      activity: 'failed_login',
      description: 'Intento de inicio de sesión fallido',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      ip: '192.168.1.102',
      device: 'Safari en iOS',
      status: 'error'
    },
    {
      id: 4,
      user: 'Luis Fernández',
      activity: 'report_generate',
      description: 'Generó reporte "Análisis de Discrepancias"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      ip: '192.168.1.103',
      device: 'Chrome en Android',
      status: 'success'
    },
    {
      id: 5,
      user: 'Elena Sánchez',
      activity: 'file_upload',
      description: 'Subió archivo "datos_inventario.xlsx"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      ip: '192.168.1.104',
      device: 'Edge en Windows',
      status: 'success'
    },
    {
      id: 6,
      user: 'María González',
      activity: 'permission_change',
      description: 'Modificó permisos de usuario Carlos Rodríguez',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      ip: '192.168.1.100',
      device: 'Chrome en Windows',
      status: 'warning'
    },
    {
      id: 7,
      user: 'Carlos Rodríguez',
      activity: 'audit_edit',
      description: 'Editó auditoría "Revisión Mensual Octubre"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      ip: '192.168.1.101',
      device: 'Firefox en macOS',
      status: 'success'
    },
    {
      id: 8,
      user: 'Ana Martínez',
      activity: 'logout',
      description: 'Cerró sesión',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
      ip: '192.168.1.102',
      device: 'Safari en iOS',
      status: 'success'
    }
  ];

  const getActivityIcon = (activity) => {
    const icons = {
      login: 'LogIn',
      logout: 'LogOut',
      audit_create: 'Plus',
      audit_edit: 'Edit',
      report_generate: 'FileText',
      file_upload: 'Upload',
      permission_change: 'Shield',
      failed_login: 'AlertTriangle'
    };
    return icons[activity] || 'Activity';
  };

  const getActivityColor = (status) => {
    const colors = {
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning'
    };
    return colors[status] || 'text-muted-foreground';
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: 'bg-success/10 text-success border-success/20',
      error: 'bg-error/10 text-error border-error/20',
      warning: 'bg-warning/10 text-warning border-warning/20'
    };
    
    const labels = {
      success: 'Exitoso',
      error: 'Error',
      warning: 'Advertencia'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[status] || 'bg-muted text-muted-foreground'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `Hace ${minutes} minutos`;
    } else if (hours < 24) {
      return `Hace ${hours} horas`;
    } else {
      return `Hace ${days} días`;
    }
  };

  const filteredLogs = activityLogs.filter(log => {
    const userMatch = selectedUser === 'all' || log.user === userOptions.find(u => u.value === selectedUser)?.label;
    const activityMatch = selectedActivity === 'all' || log.activity === selectedActivity;
    return userMatch && activityMatch;
  });

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Registro de Actividad</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Monitoreo de acciones y eventos del sistema
            </p>
          </div>
          <Button variant="outline" iconName="Download" iconPosition="left">
            Exportar Log
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            placeholder="Seleccionar usuario"
            options={userOptions}
            value={selectedUser}
            onChange={setSelectedUser}
          />
          <Select
            placeholder="Tipo de actividad"
            options={activityOptions}
            value={selectedActivity}
            onChange={setSelectedActivity}
          />
          <Select
            placeholder="Período de tiempo"
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Desktop View */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actividad</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Descripción</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Tiempo</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">IP / Dispositivo</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {log.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-foreground">{log.user}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={getActivityIcon(log.activity)} 
                          size={16} 
                          className={getActivityColor(log.status)}
                        />
                        <span className="text-foreground capitalize">
                          {log.activity.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{log.description}</td>
                    <td className="p-4 text-muted-foreground">{formatTimestamp(log.timestamp)}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="text-foreground">{log.ip}</div>
                        <div className="text-muted-foreground">{log.device}</div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(log.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 border-b border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {log.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{log.user}</div>
                      <div className="text-sm text-muted-foreground">{formatTimestamp(log.timestamp)}</div>
                    </div>
                  </div>
                  {getStatusBadge(log.status)}
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Icon 
                    name={getActivityIcon(log.activity)} 
                    size={16} 
                    className={getActivityColor(log.status)}
                  />
                  <span className="font-medium text-foreground capitalize">
                    {log.activity.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-sm text-foreground mb-2">{log.description}</p>
                
                <div className="text-xs text-muted-foreground">
                  <div>{log.ip} • {log.device}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Activity" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No hay actividad registrada</h3>
          <p className="text-muted-foreground">
            No se encontraron registros que coincidan con los filtros seleccionados
          </p>
        </div>
      )}

      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Mostrando {filteredLogs.length} de {activityLogs.length} registros
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <Icon name="ChevronLeft" size={14} />
            </Button>
            <span className="text-muted-foreground">Página 1 de 1</span>
            <Button variant="outline" size="sm" disabled>
              <Icon name="ChevronRight" size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityLog;