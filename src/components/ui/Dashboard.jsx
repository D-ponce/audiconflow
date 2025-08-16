import { hasPermission } from "utils/permissions";
import { Link } from "react-router-dom";
import Icon from "components/AppIcon"; // si lo estás usando

const DashboardMenu = () => {
  return (
    <div className="flex gap-6">

      {hasPermission("canManageAudits") && (
        <Link to="/audit-records-management">
          <Icon name="FileText" />
          Auditorías
        </Link>
      )}

      {hasPermission("canViewReports") && (
        <Link to="/reports-and-analytics">
          <Icon name="BarChart" />
          Reportes
        </Link>
      )}

      {hasPermission("canEditUsers") && (
        <Link to="/user-management">
          <Icon name="Users" />
          Usuarios
        </Link>
      )}

    </div>
  );
};

import { hasPermission } from "utils/roleAccess";

export default DashboardMenu;
