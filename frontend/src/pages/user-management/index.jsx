import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import UserTable from './components/UserTable';
import UserForm from './components/UserForm';
import RolePermissionMatrix from './components/RolePermissionMatrix';
import UserActivityLog from './components/UserActivityLog';
import UserStats from './components/UserStats';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'María González',
      email: 'maria.gonzalez@empresa.com',
      role: 'Administrador',
      department: 'Auditoría',
      phone: '+34 600 123 456',
      status: 'Activo',
      lastLogin: new Date(Date.now() - 1000 * 60 * 30),
      createdAt: '2024-01-15',
      permissions: ['dashboard_view', 'audit_create', 'audit_edit', 'users_manage']
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@empresa.com',
      role: 'Auditor Senior',
      department: 'Auditoría',
      phone: '+34 600 234 567',
      status: 'Activo',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
      createdAt: '2024-02-20',
      permissions: ['dashboard_view', 'audit_create', 'audit_edit', 'reports_view']
    },
    {
      id: 3,
      name: 'Ana Martínez',
      email: 'ana.martinez@empresa.com',
      role: 'Auditor',
      department: 'Operaciones',
      phone: '+34 600 345 678',
      status: 'Activo',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 4),
      createdAt: '2024-03-10',
      permissions: ['dashboard_view', 'audit_view', 'reports_view']
    },
    {
      id: 4,
      name: 'Luis Fernández',
      email: 'luis.fernandez@empresa.com',
      role: 'Analista',
      department: 'Finanzas',
      phone: '+34 600 456 789',
      status: 'Activo',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 6),
      createdAt: '2024-04-05',
      permissions: ['dashboard_view', 'reports_view', 'files_upload']
    },
    {
      id: 5,
      name: 'Elena Sánchez',
      email: 'elena.sanchez@empresa.com',
      role: 'Supervisor',
      department: 'Cumplimiento',
      phone: '+34 600 567 890',
      status: 'Inactivo',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      createdAt: '2024-05-12',
      permissions: ['dashboard_view', 'audit_view', 'users_view']
    },
    {
      id: 6,
      name: 'Roberto Jiménez',
      email: 'roberto.jimenez@empresa.com',
      role: 'Auditor',
      department: 'Auditoría',
      phone: '+34 600 678 901',
      status: 'Activo',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 8),
      createdAt: '2024-06-18',
      permissions: ['dashboard_view', 'audit_view', 'audit_create']
    },
    {
      id: 7,
      name: 'Patricia López',
      email: 'patricia.lopez@empresa.com',
      role: 'Analista',
      department: 'Tecnología',
      phone: '+34 600 789 012',
      status: 'Suspendido',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      createdAt: '2024-07-01',
      permissions: ['dashboard_view', 'files_upload', 'files_process']
    }
  ]);

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: 'Users' },
    { id: 'roles', label: 'Roles y Permisos', icon: 'Shield' },
    { id: 'activity', label: 'Registro de Actividad', icon: 'Activity' },
    { id: 'stats', label: 'Estadísticas', icon: 'BarChart3' }
  ];

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id ? { ...userData, id: editingUser.id } : user
      ));
    } else {
      setUsers([...users, { ...userData, id: Date.now() }]);
    }
    setIsUserFormOpen(false);
    setEditingUser(null);
  };

  const handleUserSelect = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'activate':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'Activo' } : user
        ));
        break;
      case 'deactivate':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'Inactivo' } : user
        ));
        break;
      case 'delete':
        if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedUsers.length} usuario(s)?`)) {
          setUsers(users.filter(user => !selectedUsers.includes(user.id)));
        }
        break;
      default:
        break;
    }
    setSelectedUsers([]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <UserTable
            users={users}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onBulkAction={handleBulkAction}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onSelectAll={handleSelectAll}
          />
        );
      case 'roles':
        return <RolePermissionMatrix />;
      case 'activity':
        return <UserActivityLog />;
      case 'stats':
        return <UserStats />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
              <p className="text-muted-foreground mt-2">
                Administra usuarios, roles y permisos del sistema de auditoría
              </p>
            </div>
            
            {activeTab === 'users' && (
              <Button
                variant="default"
                iconName="UserPlus"
                iconPosition="left"
                onClick={handleAddUser}
              >
                Agregar Usuario
              </Button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-border mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* User Form Modal */}
      <UserForm
        user={editingUser}
        onSave={handleSaveUser}
        onCancel={() => {
          setIsUserFormOpen(false);
          setEditingUser(null);
        }}
        isOpen={isUserFormOpen}
      />
    </div>
  );
};

export default UserManagement;