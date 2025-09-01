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
    password: '',
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
        password: '', // No mostrar password existente por seguridad
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
        password: '',
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
    { value: 'administrador', label: 'Administrador' },
    { value: 'auditor', label: 'Auditor' },
    { value: 'supervisor', label: 'Supervisor' }
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
    // Permisos para Auditor
    { id: 'data_input', label: 'Ingresar Datos', category: 'Datos' },
    { id: 'data_modify', label: 'Modificar Datos', category: 'Datos' },
    { id: 'data_validate', label: 'Validar Datos', category: 'Datos' },
    { id: 'reports_view', label: 'Consultar Reportes', category: 'Reportes' },
    { id: 'reports_generate', label: 'Generar Reportes', category: 'Reportes' },
    
    // Permisos para Supervisor
    { id: 'alerts_review', label: 'Revisar Alertas', category: 'Alertas' },
    { id: 'reports_approve', label: 'Aprobar Reportes', category: 'Reportes' },
    
    // Permisos para Administrador
    { id: 'users_manage', label: 'Gestionar Usuarios', category: 'Usuarios' }
  ];

  // Permisos por rol
  const getPermissionsByRole = (role) => {
    switch (role) {
      case 'auditor':
        return ['data_input', 'data_modify', 'data_validate', 'reports_view', 'reports_generate'];
      case 'supervisor':
        return ['reports_view', 'reports_generate', 'alerts_review', 'reports_approve'];
      case 'administrador':
        return ['users_manage', 'alerts_review'];
      default:
        return [];
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Si cambió el rol, actualizar permisos automáticamente
      if (field === 'role') {
        newData.permissions = getPermissionsByRole(value);
      }
      
      return newData;
    });
    
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

    // Validar contraseña solo para usuarios nuevos
    if (!user && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida para usuarios nuevos';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
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
                  label={user ? "Nueva contraseña (opcional)" : "Contraseña"}
                  type="password"
                  placeholder={user ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  required={!user}
                  description={user ? "Solo completa si deseas cambiar la contraseña" : "La contraseña debe tener al menos 6 caracteres"}
                />
                
                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              {formData.role && (
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-2">
                    Permisos automáticos para: {roleOptions.find(r => r.value === formData.role)?.label}
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    Los permisos se asignan automáticamente según el rol seleccionado
                  </div>
                </div>
              )}
              
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
                          disabled={true} // Los permisos se asignan automáticamente por rol
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