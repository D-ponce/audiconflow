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

export default rolePermissions;
