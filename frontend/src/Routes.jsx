import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

// Import de páginas
import LoginScreen from "./pages/login-screen";
import Dashboard from "./pages/dashboard";
import FileUploadAndProcessing from "./pages/file-upload-and-processing";
import AuditRecordsManagement from "./pages/audit-records-management";
import UserManagement from "./pages/user-management";
import ReportsAndAnalytics from "./pages/reports-and-analytics";
import NotFound from "./pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Redirigir la raíz hacia login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Pantalla de Login */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Rutas protegidas */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/file-upload-and-processing" element={<FileUploadAndProcessing />} />
          <Route path="/audit-records-management" element={<AuditRecordsManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/reports-and-analytics" element={<ReportsAndAnalytics />} />

          {/* Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
