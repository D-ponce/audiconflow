import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Leer sesión del localStorage
    const session = localStorage.getItem("audiconflow_session");
    if (session) {
      try {
        const { role } = JSON.parse(session);
        setUserRole(role);
      } catch {
        setUserRole(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("audiconflow_session");
    navigate("/login"); // Redirige al login
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/file-upload-and-processing', label: 'Procesar Datos', icon: 'Upload' },
    { path: '/reports-and-analytics', label: 'Reportes', icon: 'BarChart3' },
    { path: '/audit-records-management', label: 'Registros', icon: 'FileText' },
    // El de Usuarios se filtra abajo dependiendo del role
    { path: '/user-management', label: 'Usuarios', icon: 'Users', restricted: true }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-1000 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Brand Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="AudioWaveform" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              AudiconFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems
              .filter(item => !(item.restricted && userRole !== "administrador"))
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                    isActivePath(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
          </nav>

          {/* Logout Button (desktop) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden md:flex items-center space-x-2 text-red-600 hover:text-red-800"
          >
            <Icon name="LogOut" size={16} />
            <span>Cerrar sesión</span>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-1100 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={toggleMobileMenu} />
          <div className="fixed top-0 right-0 h-full w-64 bg-card border-l border-border shadow-lg animate-slide-in">
            <div className="flex items-center justify-between h-16 px-6 border-b border-border">
              <span className="text-lg font-semibold text-foreground">
                Menú
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            <nav className="p-4 space-y-2">
              {navigationItems
                .filter(item => !(item.restricted && userRole !== "admin"))
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth ${
                      isActivePath(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:text-red-800"
              >
                <Icon name="LogOut" size={18} />
                <span>Cerrar sesión</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
