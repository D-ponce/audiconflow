import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, Outlet } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

import LoginScreen from "pages/login-screen";
import Dashboard from "pages/dashboard";
import FileUploadAndProcessing from "pages/file-upload-and-processing";
import AuditRecordsManagement from "pages/audit-records-management";
import UserManagement from "pages/user-management";
import ReportsAndAnalytics from "pages/reports-and-analytics";
import NotFound from "pages/NotFound";

// --- Helpers de sesión (usa la misma clave que guardamos en LoginForm) ---
function isAuth() {
  try {
    const data = JSON.parse(localStorage.getItem("auth") || "null");
    return !!data?.token;
  } catch {
    return false;
  }
}

function ProtectedRoute() {
  return isAuth() ? <Outlet /> : <Navigate to="/login-screen" replace />;
}

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Landing = Login */}
          <Route path="/" element={<LoginScreen />} />
          <Route path="/login-screen" element={<LoginScreen />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/file-upload-and-processing" element={<FileUploadAndProcessing />} />
            <Route path="/audit-records-management" element={<AuditRecordsManagement />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/reports-and-analytics" element={<ReportsAndAnalytics />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

