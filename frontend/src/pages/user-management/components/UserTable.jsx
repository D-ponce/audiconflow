import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserTable = ({ users, onEditUser, onDeleteUser, onBulkAction, selectedUsers, onUserSelect, onSelectAll }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Auditor Senior', label: 'Auditor Senior' },
    { value: 'Auditor', label: 'Auditor' },
    { value: 'Analista', label: 'Analista' },
    { value: 'Supervisor', label: 'Supervisor' }
  ];

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
    { value: 'Suspendido', label: 'Suspendido' }
  ];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Activo': 'bg-success text-success-foreground',
      'Inactivo': 'bg-muted text-muted-foreground',
      'Suspendido': 'bg-warning text-warning-foreground'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-muted text-muted-foreground'}`}>
        {status}
      </span>
    );
  };

  const getLastLogin = (user) => {
    // Usar el campo formateado del backend si está disponible
    if (user.lastLoginFormatted) {
      return user.lastLoginFormatted;
    }
    
    // Fallback al formateo local si no está disponible
    if (!user.lastLogin) return 'Nunca';
    const now = new Date();
    const loginDate = new Date(user.lastLogin);
    const diffInHours = Math.floor((now - loginDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)} días`;
    return loginDate.toLocaleDateString('es-ES');
  };

  const allSelected = selectedUsers.length === sortedUsers.length && sortedUsers.length > 0;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < sortedUsers.length;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Filters */}
      <div className="p-6 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="search"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2"
          />
          <Select
            placeholder="Filtrar por rol"
            options={roleOptions}
            value={roleFilter}
            onChange={setRoleFilter}
          />
          <Select
            placeholder="Filtrar por estado"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="p-4 bg-muted border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedUsers.length} usuario(s) seleccionado(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('activate')}
              >
                Activar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('deactivate')}
              >
                Desactivar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onBulkAction('delete')}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="w-12 p-4">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              {[
                { key: 'name', label: 'Usuario' },
                { key: 'role', label: 'Rol' },
                { key: 'department', label: 'Departamento' },
                { key: 'lastLogin', label: 'Último acceso' },
                { key: 'status', label: 'Estado' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="text-left p-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    <Icon
                      name={sortField === key ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
                      size={14}
                    />
                  </div>
                </th>
              ))}
              <th className="w-32 p-4 text-center font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => onUserSelect(user.id, e.target.checked)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-foreground">{user.role}</td>
                <td className="p-4 text-foreground">{user.department}</td>
                <td className="p-4 text-muted-foreground">{getLastLogin(user)}</td>
                <td className="p-4">{getStatusBadge(user.status)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditUser(user)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {sortedUsers.map((user) => (
          <div key={user.id} className="p-4 border-b border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => onUserSelect(user.id, e.target.checked)}
                />
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-foreground">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditUser(user)}
                >
                  <Icon name="Edit" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteUser(user.id)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Rol:</span>
                <span className="ml-1 text-foreground">{user.role}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Departamento:</span>
                <span className="ml-1 text-foreground">{user.department}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Último acceso:</span>
                <span className="ml-1 text-foreground">{getLastLogin(user)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">Estado:</span>
                {getStatusBadge(user.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedUsers.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron usuarios</h3>
          <p className="text-muted-foreground">
            {searchTerm || roleFilter || statusFilter
              ? 'Intenta ajustar los filtros de búsqueda' :'No hay usuarios registrados en el sistema'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTable;