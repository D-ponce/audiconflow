import React from "react";
import { Navigate } from "react-router-dom";
import RolePermissionMatrix from "components/RolePermissionMatrix";

const RoleBasedRoute = ({ children, permissionKey }) => {
  const session = JSON.parse(localStorage.getItem("audiconflow_session") || "{}");
  const role = session?.role;
  const permissions = RolePermissionMatrix[role] || {};

  if (!role) return <Navigate to="/login-screen" replace />;
  if (!permissions[permissionKey]) return <Navigate to="/dashboard" replace />;

  return children;
};

export default RoleBasedRoute;
