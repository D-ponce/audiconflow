// Mismo modelo que RolePermissionMatrix
const rolePermissions = {
  auditor: {
    canViewReports: true,
    canEditUsers: false,
    canManageAudits: false,
  },
  supervisor: {
    canViewReports: true,
    canEditUsers: false,
    canManageAudits: true,
  },
  administrador: {
    canViewReports: true,
    canEditUsers: true,
    canManageAudits: true,
  },
};

export function getRole() {
  try {
    const data = JSON.parse(localStorage.getItem("auth") || "{}");
    return data?.role;
  } catch {
    return null;
  }
}

export function hasPermission(permissionKey) {
  const role = getRole();
  return rolePermissions[role]?.[permissionKey] || false;
}

export { rolePermissions };
