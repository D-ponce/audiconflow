// src/Routes.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "components/layouts/MainLayout";

const Dashboard = lazy(() => import("pages/dashboard"));
const FileUploadAndProcessing = lazy(() => import("pages/file-upload-and-processing"));
const AuditRecordsManagement = lazy(() => import("pages/audit-records-management"));
const ReportsAndAnalytics = lazy(() => import("pages/reports-and-analytics"));
const UserManagement = lazy(() => import("pages/user-management"));
const LoginScreen = lazy(() => import("pages/login-screen"));

function Loader() {
  return <div className="w-full py-10 text-center text-muted-foreground">Cargando…</div>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/file-upload-and-processing" element={<FileUploadAndProcessing />} />
            <Route path="/audit-records-management" element={<AuditRecordsManagement />} />
            <Route path="/reports-and-analytics" element={<ReportsAndAnalytics />} />
            <Route path="/user-management" element={<UserManagement />} />
          </Route>

          <Route path="/login-screen" element={<LoginScreen />} />
          <Route path="*" element={<div className="p-6">404 – Página no encontrada</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
