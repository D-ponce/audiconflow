import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "components/AppIcon";
import Button from "components/ui/Button";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/file-upload-and-processing", label: "Procesar Datos", icon: "Upload" },
  { path: "/audit-records-management", label: "Auditorías", icon: "FileText" },
  { path: "/reports-and-analytics", label: "Reportes", icon: "BarChart3" },
  { path: "/user-management", label: "Usuarios", icon: "Users" },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path ? "text-primary" : "text-muted-foreground";

  const handleLogout = () => {
    localStorage.removeItem("audiconflow_session");
    setShowConfirm(false);
    navigate("/login-screen");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/70 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Icon name="ShieldCheck" className="h-5 w-5 text-primary" />
            <span className="font-semibold">AudiconFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm hover:text-primary transition-colors flex items-center gap-1 ${isActive(
                  item.path
                )}`}
                aria-current={location.pathname === item.path ? "page" : undefined}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" onClick={() => setShowConfirm(true)} iconName="LogOut">
              Cerrar sesión
            </Button>
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border hover:bg-accent"
            onClick={() => setIsMobileMenuOpen((s) => !s)}
            aria-label="Abrir menú"
          >
            <Icon name="Menu" className="h-5 w-5" />
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <nav className="px-4 py-2 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg hover:bg-accent flex items-center gap-2 ${isActive(
                    item.path
                  )}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="justify-start"
                iconName="LogOut"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowConfirm(true);
                }}
              >
                Cerrar sesión
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Modal de confirmación animado */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 w-full max-w-sm scale-100 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Icon name="AlertTriangle" className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-semibold">¿Cerrar sesión?</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              ¿Estás segura de que deseas cerrar sesión? Se cerrará tu sesión activa en AudiconFlow.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
