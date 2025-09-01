import React, { useState, useEffect } from 'react';
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Cargar usuarios desde la API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Datos mock mientras el backend no esté disponible
      const mockUsers = [
        {
          _id: '1',
          name: 'Administrador',
          email: 'admin@audiconflow.com',
          role: 'administrador',
          department: 'Administración',
          phone: '+34 600 000 000',
          status: 'Activo',
          createdAt: new Date().toISOString(),
          permissions: ['users_manage', 'alerts_review']
        },
        {
          _id: '2',
          name: 'Juan Pérez',
          email: 'juan@audiconflow.com',
          role: 'auditor',
          department: 'Auditoría',
          phone: '+34 600 111 222',
          status: 'Activo',
          createdAt: new Date().toISOString(),
          permissions: ['audit_view']
        }
      ];

      // Intentar conectar con la API, si falla usar datos mock
      try {
        const response = await fetch('http://localhost:5000/api/users');
        const data = await response.json();
      
        if (response.ok) {
          // Transformar datos para compatibilidad con el frontend
          const transformedUsers = data.map(user => ({
            id: user._id,
            name: user.name || '',
            email: user.email || '',
            role: user.role || '',
            department: user.department || '',
            phone: user.phone || '',
            status: user.status || 'Activo',
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
            createdAt: user.createdAt,
            permissions: user.permissions || []
          }));
          setUsers(transformedUsers);
        } else {
          throw new Error(data.error || 'Error al cargar usuarios');
        }
      } catch (apiError) {
        console.log('⚠️ API no disponible, usando datos mock');
        // Usar datos mock si la API no está disponible
        const transformedMockUsers = mockUsers.map(user => ({
          id: user._id,
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          department: user.department || '',
          phone: user.phone || '',
          status: user.status || 'Activo',
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
          createdAt: user.createdAt,
          permissions: user.permissions || []
        }));
        setUsers(transformedMockUsers);
      }
    } catch (err) {
      console.error('❌ Error general:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchUsers(); // Recargar lista
          setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
          const data = await response.json();
          alert(data.error || 'Error al eliminar usuario');
        }
      } catch (err) {
        console.error('❌ Error al eliminar usuario:', err);
        alert('Error de conexión con el servidor');
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      const url = editingUser 
        ? `http://localhost:5000/api/users/${editingUser.id}`
        : 'http://localhost:5000/api/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchUsers(); // Recargar lista
        setIsUserFormOpen(false);
        setEditingUser(null);
        alert(data.message || 'Usuario guardado exitosamente');
      } else {
        alert(data.error || 'Error al guardar usuario');
      }
    } catch (err) {
      console.error('❌ Error al guardar usuario:', err);
      alert('Error de conexión con el servidor');
    }
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

  const handleBulkAction = async (action) => {
    try {
      if (action === 'delete') {
        if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedUsers.length} usuario(s)?`)) {
          const response = await fetch('http://localhost:5000/api/users/bulk', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds: selectedUsers }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            await fetchUsers(); // Recargar lista
            alert(data.message || 'Usuarios eliminados exitosamente');
          } else {
            alert(data.error || 'Error al eliminar usuarios');
          }
        }
      } else {
        // Para activate, deactivate, suspend
        const response = await fetch('http://localhost:5000/api/users/bulk', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userIds: selectedUsers, 
            action: action 
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          await fetchUsers(); // Recargar lista
          alert(data.message || 'Usuarios actualizados exitosamente');
        } else {
          alert(data.error || 'Error al actualizar usuarios');
        }
      }
    } catch (err) {
      console.error('❌ Error en acción masiva:', err);
      alert('Error de conexión con el servidor');
    } finally {
      setSelectedUsers([]);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-100">
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Cargando usuarios...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Error al cargar usuarios</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchUsers} variant="outline">
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : (
              renderTabContent()
            )}
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