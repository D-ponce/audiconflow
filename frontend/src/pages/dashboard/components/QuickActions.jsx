import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Leer sesión del localStorage
    const session = localStorage.getItem("audiconflow_session");
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        setUserRole(sessionData.role);
      } catch (error) {
        setUserRole(null);
      }
    }
  }, []);

  const actions = [
    {
      id: 1,
      title: 'Nueva Auditoría',
      description: 'Iniciar proceso de auditoría',
      icon: 'Plus',
      variant: 'default',
      onClick: () => navigate('/file-upload-and-processing'),
      restricted: 'administrador' // Restringido para administradores
    },
    {
      id: 2,
      title: 'Ver Reportes',
      description: 'Acceder a reportes pendientes',
      icon: 'BarChart3',
      variant: 'outline',
      onClick: () => navigate('/reports-and-analytics')
    },
    {
      id: 3,
      title: 'Gestionar Registros',
      description: 'Administrar registros de auditoría',
      icon: 'FileText',
      variant: 'outline',
      onClick: () => navigate('/audit-records-management')
    },
    {
      id: 4,
      title: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      icon: 'Users',
      variant: 'outline',
      onClick: () => navigate('/user-management'),
      allowedRoles: ['administrador'] // Solo para administradores
    }
  ];

  return (
    <div className="powerbi-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Acciones Rápidas</h3>
      <div className="space-y-3">
        {actions
          .filter(action => {
            // Filtrar "Nueva Auditoría" para administradores
            if (action.restricted === 'administrador' && userRole === 'administrador') {
              return false;
            }
            // Filtrar "Usuarios" para no administradores
            if (action.allowedRoles && !action.allowedRoles.includes(userRole)) {
              return false;
            }
            return true;
          })
          .map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              fullWidth
              iconName={action.icon}
              iconPosition="left"
              onClick={action.onClick}
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
      </div>
    </div>
  );
};

export default QuickActions;