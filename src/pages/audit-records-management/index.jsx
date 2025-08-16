import React, { useEffect, useMemo, useState } from "react";
import Icon from "components/AppIcon";
import Button from "components/ui/Button";
import AdvancedFilters from "./components/AdvancedFilters";
import AuditTable from "./components/AuditTable";

/**
 * Página: Gestión de Auditorías
 * Ruta esperada: /audit-records-management
 *
 * Dependencias internas:
 *  - ./components/AdvancedFilters.jsx  (ya te la dejé corregida)
 *  - ./components/AuditTable.jsx       (ya te la dejé completa)
 */

export default function AuditRecordsManagement() {
  // Dataset base (podrías reemplazar por fetch a tu API)
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros aplicados desde <AdvancedFilters />
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "", preset: "last30days" },
    locations: [],
    auditTypes: [],
    auditStatus: [],
    auditors: [],
    complianceScore: { min: 0, max: 100 },
    riskLevel: [],
    departments: [],
    customFields: {},
  });

  // Simulación de carga de datos (reemplaza con tu fetch real)
  useEffect(() => {
    setLoading(true);
    const mock = [
      {
        id: "A-1001",
        title: "Revisión de Usuarios Oracle",
        area: "TI",
        auditor: "María González",
        status: "En curso",
        severity: "Alta",
        createdAt: "2025-07-01",
        dueAt: "2025-07-15",
        findings: 5,
        location: "casa_matriz",
        auditType: "contabilidad_usuarios",
        risk: "high",
        department: "it",
        compliance: 72,
      },
      {
        id: "A-1002",
        title: "Caja diaria sucursal Centro",
        area: "Finanzas",
        auditor: "José Ruiz",
        status: "Cerrada",
        severity: "Media",
        createdAt: "2025-06-20",
        dueAt: "2025-06-25",
        findings: 2,
        location: "local_s",
        auditType: "finanzas_precios",
        risk: "low",
        department: "finance",
        compliance: 94,
      },
      {
        id: "A-1003",
        title: "Stock bodega CD Sur",
        area: "Operaciones",
        auditor: "Ana Martín",
        status: "Pendiente",
        severity: "Baja",
        createdAt: "2025-07-05",
        dueAt: "2025-07-28",
        findings: 0,
        location: "cd_s",
        auditType: "finanzas_stock",
        risk: "medium",
        department: "inventory",
        compliance: 88,
      },
    ];
    const t = setTimeout(() => {
      setAudits(mock);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // Aplicación de filtros básicos al dataset
  const filteredData = useMemo(() => {
    let rows = audits;

    // Fecha: usamos createdAt contra preset/start/end
    const { preset, start, end } = filters.dateRange || {};
    const now = new Date();

    const presetToRange = () => {
      if (preset === "today") {
        const d0 = new Date();
        const d1 = new Date();
        return [d0, d1];
      }
      if (preset === "last7days") {
        const d0 = new Date(now);
        d0.setDate(d0.getDate() - 6);
        return [d0, now];
      }
      if (preset === "last30days") {
        const d0 = new Date(now);
        d0.setDate(d0.getDate() - 29);
        return [d0, now];
      }
      if (preset === "last90days") {
        const d0 = new Date(now);
        d0.setDate(d0.getDate() - 89);
        return [d0, now];
      }
      if (preset === "thisMonth") {
        const d0 = new Date(now.getFullYear(), now.getMonth(), 1);
        return [d0, now];
      }
      if (preset === "lastMonth") {
        const d0 = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const d1 = new Date(now.getFullYear(), now.getMonth(), 0);
        return [d0, d1];
      }
      if (preset === "thisQuarter") {
        const q = Math.floor(now.getMonth() / 3);
        const d0 = new Date(now.getFullYear(), q * 3, 1);
        return [d0, now];
      }
      if (preset === "custom" && start && end) {
        return [new Date(start), new Date(end)];
      }
      return null;
    };

    const range = presetToRange();
    if (range) {
      const [d0, d1] = range;
      const d1End = new Date(d1);
      d1End.setHours(23, 59, 59, 999);
      rows = rows.filter((r) => {
        const c = new Date(r.createdAt);
        return c >= d0 && c <= d1End;
      });
    }

    // Multi-filtros (si están marcados)
    if (filters.locations?.length) {
      rows = rows.filter((r) => filters.locations.includes(r.location));
    }
    if (filters.auditTypes?.length) {
      rows = rows.filter((r) => filters.auditTypes.includes(r.auditType));
    }
    if (filters.auditStatus?.length) {
      rows = rows.filter((r) => filters.auditStatus.includes(r.statusKey ?? r.status));
    }
    if (filters.auditors?.length) {
      rows = rows.filter((r) => filters.auditors.includes(slugify(r.auditor)));
    }
    if (filters.riskLevel?.length) {
      rows = rows.filter((r) => filters.riskLevel.includes(r.risk));
    }
    if (filters.departments?.length) {
      rows = rows.filter((r) => filters.departments.includes(r.department));
    }

    // Rango de cumplimiento (0–100)
    const min = Number(filters.complianceScore?.min ?? 0);
    const max = Number(filters.complianceScore?.max ?? 100);
    rows = rows.filter((r) => {
      const c = Number(r.compliance ?? 0);
      return c >= min && c <= max;
    });

    return rows;
  }, [audits, filters]);

  const handleApplyFilters = (f) => setFilters(f);
  const handleResetFilters = () =>
    setFilters({
      dateRange: { start: "", end: "", preset: "last30days" },
      locations: [],
      auditTypes: [],
      auditStatus: [],
      auditors: [],
      complianceScore: { min: 0, max: 100 },
      riskLevel: [],
      departments: [],
      customFields: {},
    });

  const handleDeleteMany = async (ids) => {
    // Si más adelante conectas API, haz el DELETE aquí
    setAudits((prev) => prev.filter((r) => !ids.includes(r.id)));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="FileText" className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Gestión de Auditorías</h1>
            <p className="text-sm text-muted-foreground">
              Visualiza, filtra y exporta auditorías. Usa los filtros avanzados para acotar el rango de fechas, ubicación y tipo.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" iconName="Plus">
            Nueva auditoría
          </Button>
          <Button variant="ghost" iconName="RefreshCcw" onClick={() => window.location.reload()}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <AdvancedFilters onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} />

      {/* Tabla */}
      <div className="bg-card rounded-lg border border-border p-4">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Cargando auditorías…</div>
        ) : (
          <AuditTable
            data={filteredData.map((r) => ({
              id: r.id,
              title: r.title,
              area: r.area,
              auditor: r.auditor,
              status: r.status,      // Abierta | En curso | Cerrada | Pendiente | Bloqueada
              severity: r.severity,  // Baja | Media | Alta | Crítica
              createdAt: r.createdAt,
              dueAt: r.dueAt,
              findings: r.findings,
            }))}
            onRowClick={(row) => console.log("Abrir detalle de", row.id)}
            onDeleteMany={handleDeleteMany}
            initialPageSize={10}
          />
        )}
      </div>
    </div>
  );
}

// util local
function slugify(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}
