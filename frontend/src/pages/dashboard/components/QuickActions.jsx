import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      title: 'Nueva Auditoría',
      description: 'Iniciar proceso de auditoría',
      icon: 'Plus',
      variant: 'default',
      onClick: () => navigate('/file-upload-and-processing')
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
      onClick: () => navigate('/user-management')
    }
  ];

  return (
    <div className="powerbi-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Acciones Rápidas</h3>
      <div className="space-y-3">
        {actions.map((action) => (
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