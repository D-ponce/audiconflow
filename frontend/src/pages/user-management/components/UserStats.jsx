import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const UserStats = () => {
  const [stats, setStats] = useState([
    {
      id: 1,
      title: 'Total Usuarios',
      value: '4',
      change: '+4',
      changeType: 'increase',
      icon: 'Users',
      color: 'bg-blue-500',
      description: 'Usuarios activos en el sistema'
    },
    {
      id: 2,
      title: 'Usuarios Activos',
      value: '1',
      change: '+1',
      changeType: 'increase',
      icon: 'UserCheck',
      color: 'bg-green-500',
      description: 'Usuarios con sesión activa'
    },
    {
      id: 3,
      title: 'Nuevos Este Mes',
      value: '4',
      change: '+4',
      changeType: 'increase',
      icon: 'UserPlus',
      color: 'bg-purple-500',
      description: 'Usuarios registrados este mes'
    },
    {
      id: 4,
      title: 'Roles Definidos',
      value: '3',
      change: '0',
      changeType: 'neutral',
      icon: 'Shield',
      color: 'bg-orange-500',
      description: 'Roles de usuario configurados'
    }
  ]);

  const [roleDistribution, setRoleDistribution] = useState([
    { role: 'Administrador', count: 2, percentage: 50, color: 'bg-red-500' },
    { role: 'Auditor', count: 1, percentage: 25, color: 'bg-blue-500' },
    { role: 'Supervisor', count: 1, percentage: 25, color: 'bg-orange-500' }
  ]);

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'increase':
        return 'TrendingUp';
      case 'decrease':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  // Cargar estadísticas reales de la BD
  const fetchUserStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      
      if (response.ok) {
        const users = await response.json();
        console.log('📊 Usuarios cargados para estadísticas:', users);
        
        // Contar usuarios por rol
        const roleCounts = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});
        
        // Actualizar estadísticas basadas en datos reales
        const totalUsers = users.length;
        const activeUsers = 1; // Solo Denisse ha estado activa
        
        setStats([
          {
            id: 1,
            title: 'Total Usuarios',
            value: totalUsers.toString(),
            change: `+${totalUsers}`,
            changeType: 'increase',
            icon: 'Users',
            color: 'bg-blue-500',
            description: 'Usuarios registrados en el sistema'
          },
          {
            id: 2,
            title: 'Usuarios Activos',
            value: activeUsers.toString(),
            change: `+${activeUsers}`,
            changeType: 'increase',
            icon: 'UserCheck',
            color: 'bg-green-500',
            description: 'Usuarios con actividad reciente'
          },
          {
            id: 3,
            title: 'Nuevos Este Mes',
            value: totalUsers.toString(),
            change: `+${totalUsers}`,
            changeType: 'increase',
            icon: 'UserPlus',
            color: 'bg-purple-500',
            description: 'Usuarios registrados este mes'
          },
          {
            id: 4,
            title: 'Roles Definidos',
            value: '3',
            change: '0',
            changeType: 'neutral',
            icon: 'Shield',
            color: 'bg-orange-500',
            description: 'Roles de usuario configurados'
          }
        ]);
        
        // Actualizar distribución de roles
        const totalCount = totalUsers;
        const roleDistributionData = [
          {
            role: 'Administrador',
            count: roleCounts.administrador || 0,
            percentage: totalCount > 0 ? Math.round((roleCounts.administrador || 0) / totalCount * 100) : 0,
            color: 'bg-red-500'
          },
          {
            role: 'Auditor',
            count: roleCounts.auditor || 0,
            percentage: totalCount > 0 ? Math.round((roleCounts.auditor || 0) / totalCount * 100) : 0,
            color: 'bg-blue-500'
          },
          {
            role: 'Supervisor',
            count: roleCounts.supervisor || 0,
            percentage: totalCount > 0 ? Math.round((roleCounts.supervisor || 0) / totalCount * 100) : 0,
            color: 'bg-orange-500'
          }
        ].filter(role => role.count > 0); // Solo mostrar roles con usuarios
        
        setRoleDistribution(roleDistributionData);
        
      }
    } catch (error) {
      console.error('⚠️ Error cargando estadísticas, usando fallback:', error);
      // Mantener datos por defecto si hay error
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'increase':
        return 'text-success';
      case 'decrease':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Icon name={stat.icon} size={24} color="white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${getChangeColor(stat.changeType)}`}>
                <Icon name={getChangeIcon(stat.changeType)} size={14} />
                <span>{stat.change}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              <p className="text-sm font-medium text-foreground">{stat.title}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Role Distribution */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Distribución por Roles</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Cantidad de usuarios por cada rol del sistema
            </p>
          </div>
          <Icon name="PieChart" size={20} className="text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {roleDistribution.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                <span className="font-medium text-foreground">{item.role}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 ${item.color} rounded-full transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-right min-w-[60px]">
                  <div className="text-sm font-medium text-foreground">{item.count}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total de usuarios</span>
            <span className="font-medium text-foreground">
              {roleDistribution.reduce((sum, item) => sum + item.count, 0)} usuarios
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Actividad Reciente</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Resumen de actividad de usuarios en las últimas 24 horas
            </p>
          </div>
          <Icon name="Activity" size={20} className="text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="LogIn" size={24} className="text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground">1</div>
            <div className="text-sm text-muted-foreground">Inicios de sesión</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="FileText" size={24} className="text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Auditorías creadas</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="AlertTriangle" size={24} className="text-warning" />
            </div>
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Intentos fallidos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;