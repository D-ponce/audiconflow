import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import NewAuditModal from '../../pages/dashboard/components/NewAuditModal';
import AuditService from '../../services/auditService';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem("audiconflow_session");
    navigate("/login"); // Redirige al login
  };

  const handleNewAudit = async (auditData) => {
    try {
      const response = await AuditService.createAudit(auditData);
      console.log('Auditoría creada exitosamente:', response.audit);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      notification.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        ✅ Auditoría ${response.audit.auditId} creada exitosamente
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
      // Refresh audit records page if currently on it
      if (window.location.pathname === '/audit-records-management') {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Error al crear auditoría:', error);
      throw error;
    }
  };

  const navigationItems = [
    { path: '/reports-and-analytics', label: 'Reportes', icon: 'BarChart3', color: 'bg-orange-500 hover:bg-orange-600' },
    { path: '/audit-records-management', label: 'Registros', icon: 'FileText', color: 'bg-cyan-500 hover:bg-cyan-600' },
    // El de Usuarios se filtra abajo dependiendo del role
    { path: '/user-management', label: 'Usuarios', icon: 'Users', restricted: true, color: 'bg-pink-500 hover:bg-pink-600' }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-1000 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 shadow-xl">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Brand Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg">
              <Icon name="AudioWaveform" size={20} color="white" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg">
              AudiconFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {/* Dashboard Link */}
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
                isActivePath('/dashboard')
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Icon name="LayoutDashboard" size={16} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/audit-records-management"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
                location.pathname === '/audit-records-management'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Icon name="FileText" size={16} />
              <span>Registros</span>
            </Link>


            {/* Usuarios Link - Solo para administradores */}
            {userRole === "administrador" && (
              <Link
                to="/user-management"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
                  location.pathname === '/user-management'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Icon name="Users" size={16} />
                <span>Usuarios</span>
              </Link>
            )}

            {/* Iniciar Auditoría Button - Solo para usuarios no administradores */}
            {userRole !== "administrador" && (
              <Button
                onClick={() => setShowNewAuditModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
              >
                <span>Nueva Auditoría</span>
              </Button>
            )}

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
            >
              <Icon name="LogOut" size={16} />
              <span>Cerrar Sesión</span>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="md:hidden bg-white/20 hover:bg-white/30 text-white"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-1100 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={toggleMobileMenu} />
          <div className="fixed top-0 right-0 h-full w-64 glass-effect border-l border-white/20 shadow-2xl animate-slide-in">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 border-b border-purple-300 shadow-lg">
              <div className="flex items-center justify-between h-16 px-6">
                <span className="text-lg font-semibold text-white">
                  Menú
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="text-white hover:bg-white/20"
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {/* Dashboard Link (mobile) */}
              <Link
                to="/dashboard"
                onClick={toggleMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-white ${
                  isActivePath('/dashboard')
                    ? 'bg-purple-500 opacity-100'
                    : 'bg-purple-500 opacity-80 hover:opacity-100'
                }`}
              >
                <Icon name="LayoutDashboard" size={18} />
                <span>Dashboard</span>
              </Link>

              {/* Iniciar Auditoría Button (mobile) - Solo para usuarios no administradores */}
              {userRole !== "administrador" && (
                <button
                  onClick={() => {
                    setShowNewAuditModal(true);
                    toggleMobileMenu();
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <span className="font-semibold">Nueva Auditoría</span>
                </button>
              )}

              {navigationItems
                .filter(item => !(item.restricted && userRole !== "administrador"))
                .filter(item => item.path !== '/dashboard') // Exclude dashboard since we show it separately
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-white ${
                      isActivePath(item.path)
                        ? `${item.color} opacity-100`
                        : `${item.color} opacity-80 hover:opacity-100`
                    }`}
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{item.label}</span>
                  </Link>
                ))}

              {/* Logout Button (mobile) */}
              <button
                onClick={() => {
                  toggleMobileMenu();
                  handleLogout();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Icon name="LogOut" size={18} />
                <span>Cerrar sesión</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* New Audit Modal */}
      <NewAuditModal
        isOpen={showNewAuditModal}
        onClose={() => setShowNewAuditModal(false)}
        onSubmit={handleNewAudit}
      />
    </>
  );
};

export default Header;
