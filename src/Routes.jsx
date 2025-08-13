import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import LoginScreen from "pages/login-screen";
import Dashboard from "pages/dashboard";
import FileUploadAndProcessing from "pages/file-upload-and-processing";
import AuditRecordsManagement from "pages/audit-records-management";
import UserManagement from "pages/user-management";
import ReportsAndAnalytics from "pages/reports-and-analytics";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login-screen" element={<LoginScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/file-upload-and-processing" element={<FileUploadAndProcessing />} />
        <Route path="/audit-records-management" element={<AuditRecordsManagement />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/reports-and-analytics" element={<ReportsAndAnalytics />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;