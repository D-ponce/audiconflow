import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const RolePermissionMatrix = () => {
  const [selectedRole, setSelectedRole] = useState('Administrador');

  const roles = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      userCount: 3,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'senior_auditor',
      name: 'Auditor Senior',
      description: 'Gestión avanzada de auditorías',
      userCount: 8,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'auditor',
      name: 'Auditor',
      description: 'Ejecución de auditorías',
      userCount: 15,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'analyst',
      name: 'Analista',
      description: 'Análisis de datos y reportes',
      userCount: 12,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      description: 'Supervisión de operaciones',
      userCount: 6,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const permissions = [
    {
      category: 'Dashboard',
      items: [
        { id: 'dashboard_view', name: 'Ver Dashboard', description: 'Acceso al panel principal' },
        { id: 'dashboard_customize', name: 'Personalizar Dashboard', description: 'Modificar widgets y layout' }
      ]
    },
    {
      category: 'Auditorías',
      items: [
        { id: 'audit_view', name: 'Ver Auditorías', description: 'Consultar auditorías existentes' },
        { id: 'audit_create', name: 'Crear Auditorías', description: 'Iniciar nuevas auditorías' },
        { id: 'audit_edit', name: 'Editar Auditorías', description: 'Modificar auditorías en progreso' },
        { id: 'audit_delete', name: 'Eliminar Auditorías', description: 'Borrar auditorías del sistema' },
        { id: 'audit_approve', name: 'Aprobar Auditorías', description: 'Validar y aprobar resultados' }
      ]
    },
    {
      category: 'Reportes',
      items: [
        { id: 'reports_view', name: 'Ver Reportes', description: 'Consultar reportes generados' },
        { id: 'reports_create', name: 'Crear Reportes', description: 'Generar nuevos reportes' },
        { id: 'reports_export', name: 'Exportar Reportes', description: 'Descargar reportes en varios formatos' },
        { id: 'reports_schedule', name: 'Programar Reportes', description: 'Automatizar generación de reportes' }
      ]
    },
    {
      category: 'Usuarios',
      items: [
        { id: 'users_view', name: 'Ver Usuarios', description: 'Consultar lista de usuarios' },
        { id: 'users_create', name: 'Crear Usuarios', description: 'Agregar nuevos usuarios' },
        { id: 'users_edit', name: 'Editar Usuarios', description: 'Modificar información de usuarios' },
        { id: 'users_delete', name: 'Eliminar Usuarios', description: 'Remover usuarios del sistema' },
        { id: 'users_permissions', name: 'Gestionar Permisos', description: 'Asignar y modificar permisos' }
      ]
    },
    {
      category: 'Archivos',
      items: [
        { id: 'files_upload', name: 'Subir Archivos', description: 'Cargar documentos al sistema' },
        { id: 'files_process', name: 'Procesar Archivos', description: 'Ejecutar procesamiento de datos' },
        { id: 'files_download', name: 'Descargar Archivos', description: 'Obtener archivos del sistema' },
        { id: 'files_delete', name: 'Eliminar Archivos', description: 'Borrar archivos del sistema' }
      ]
    },
    {
      category: 'Sistema',
      items: [
        { id: 'system_config', name: 'Configuración', description: 'Modificar configuración del sistema' },
        { id: 'system_logs', name: 'Ver Logs', description: 'Consultar registros del sistema' },
        { id: 'system_backup', name: 'Respaldos', description: 'Gestionar copias de seguridad' },
        { id: 'system_maintenance', name: 'Mantenimiento', description: 'Ejecutar tareas de mantenimiento' }
      ]
    }
  ];

  const rolePermissions = {
    'Administrador': permissions.flatMap(cat => cat.items.map(item => item.id)),
    'Auditor Senior': [
      'dashboard_view', 'dashboard_customize',
      'audit_view', 'audit_create', 'audit_edit', 'audit_approve',
      'reports_view', 'reports_create', 'reports_export', 'reports_schedule',
      'users_view',
      'files_upload', 'files_process', 'files_download',
      'system_logs'
    ],
    'Auditor': [
      'dashboard_view',
      'audit_view', 'audit_create', 'audit_edit',
      'reports_view', 'reports_create', 'reports_export',
      'files_upload', 'files_process', 'files_download'
    ],
    'Analista': [
      'dashboard_view',
      'audit_view',
      'reports_view', 'reports_create', 'reports_export',
      'files_upload', 'files_download'
    ],
    'Supervisor': [
      'dashboard_view', 'dashboard_customize',
      'audit_view', 'audit_approve',
      'reports_view', 'reports_export',
      'users_view',
      'files_download'
    ]
  };

  const hasPermission = (permissionId) => {
    return rolePermissions[selectedRole]?.includes(permissionId) || false;
  };

  const getPermissionCount = (roleName) => {
    return rolePermissions[roleName]?.length || 0;
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Matriz de Permisos por Rol</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los permisos asignados a cada rol del sistema
            </p>
          </div>
          <Button variant="outline" iconName="Settings" iconPosition="left">
            Configurar Roles
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Roles List */}
        <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border">
          <div className="p-4">
            <h4 className="font-medium text-foreground mb-4">Roles Disponibles</h4>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRole === role.name
                      ? 'border-primary bg-primary/5' :'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRole(role.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{role.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                      {role.userCount} usuarios
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Icon name="Shield" size={12} className="mr-1" />
                    {getPermissionCount(role.name)} permisos asignados
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:w-2/3">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">
                Permisos para: <span className="text-primary">{selectedRole}</span>
              </h4>
              <div className="text-sm text-muted-foreground">
                {getPermissionCount(selectedRole)} de {permissions.flatMap(cat => cat.items).length} permisos
              </div>
            </div>

            <div className="space-y-6">
              {permissions.map((category) => (
                <div key={category.category}>
                  <h5 className="font-medium text-foreground mb-3 flex items-center">
                    <Icon name="Folder" size={16} className="mr-2" />
                    {category.category}
                  </h5>
                  <div className="space-y-2 ml-6">
                    {category.items.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={hasPermission(permission.id)}
                          onChange={() => {}}
                          disabled
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{permission.name}</span>
                            {hasPermission(permission.id) && (
                              <Icon name="Check" size={14} className="text-success" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Icon name="Info" size={14} className="mr-1" />
            Los permisos se aplican inmediatamente al guardar cambios
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Restablecer
            </Button>
            <Button variant="default" size="sm">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionMatrix;