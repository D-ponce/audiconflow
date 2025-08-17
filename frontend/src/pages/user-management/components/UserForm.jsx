import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserForm = ({ user, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    status: 'Activo',
    permissions: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        department: user.department || '',
        phone: user.phone || '',
        status: user.status || 'Activo',
        permissions: user.permissions || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        phone: '',
        status: 'Activo',
        permissions: []
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const roleOptions = [
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Auditor Senior', label: 'Auditor Senior' },
    { value: 'Auditor', label: 'Auditor' },
    { value: 'Analista', label: 'Analista' },
    { value: 'Supervisor', label: 'Supervisor' }
  ];

  const departmentOptions = [
    { value: 'Auditoría', label: 'Auditoría' },
    { value: 'Finanzas', label: 'Finanzas' },
    { value: 'Operaciones', label: 'Operaciones' },
    { value: 'Tecnología', label: 'Tecnología' },
    { value: 'Recursos Humanos', label: 'Recursos Humanos' },
    { value: 'Cumplimiento', label: 'Cumplimiento' }
  ];

  const statusOptions = [
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
    { value: 'Suspendido', label: 'Suspendido' }
  ];

  const availablePermissions = [
    { id: 'dashboard_view', label: 'Ver Dashboard', category: 'Dashboard' },
    { id: 'audit_create', label: 'Crear Auditorías', category: 'Auditorías' },
    { id: 'audit_edit', label: 'Editar Auditorías', category: 'Auditorías' },
    { id: 'audit_delete', label: 'Eliminar Auditorías', category: 'Auditorías' },
    { id: 'audit_view', label: 'Ver Auditorías', category: 'Auditorías' },
    { id: 'reports_view', label: 'Ver Reportes', category: 'Reportes' },
    { id: 'reports_export', label: 'Exportar Reportes', category: 'Reportes' },
    { id: 'users_manage', label: 'Gestionar Usuarios', category: 'Usuarios' },
    { id: 'users_view', label: 'Ver Usuarios', category: 'Usuarios' },
    { id: 'files_upload', label: 'Subir Archivos', category: 'Archivos' },
    { id: 'files_process', label: 'Procesar Archivos', category: 'Archivos' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePermissionChange = (permissionId, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    if (!formData.department) {
      newErrors.department = 'El departamento es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        id: user?.id || Date.now(),
        createdAt: user?.createdAt || new Date().toISOString(),
        lastLogin: user?.lastLogin || null
      });
    }
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {user ? 'Editar Usuario' : 'Agregar Usuario'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Información Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre completo"
                  type="text"
                  placeholder="Ingresa el nombre completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  required
                />
                
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                
                <Select
                  label="Estado"
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  required
                />
              </div>
            </div>

            {/* Role and Department */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Rol y Departamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Rol"
                  options={roleOptions}
                  value={formData.role}
                  onChange={(value) => handleInputChange('role', value)}
                  error={errors.role}
                  required
                />
                
                <Select
                  label="Departamento"
                  options={departmentOptions}
                  value={formData.department}
                  onChange={(value) => handleInputChange('department', value)}
                  error={errors.department}
                  required
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Permisos</h3>
              
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-foreground">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <Checkbox
                          key={permission.id}
                          label={permission.label}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/50">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
            >
              {user ? 'Actualizar Usuario' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;