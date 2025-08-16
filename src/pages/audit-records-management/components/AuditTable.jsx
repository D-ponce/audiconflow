// AuditTable.jsx
import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * AuditTable
 * Componente genérico de tabla para auditorías.
 *
 * Props:
 *  - data: Array de objetos con campos { id, title, area, auditor, status, severity, createdAt, dueAt, findings }
 *  - onRowClick?: (row) => void
 *  - onDeleteMany?: (ids: string[]) => Promise<void> | void
 *  - pageSizeOptions?: number[]  (por defecto [10, 25, 50])
 *  - initialPageSize?: number    (por defecto 10)
 *  - emptyState?: ReactNode
 *
 * Ejemplo mínimo de uso:
 *
 *  const data = [
 *    { id: "A-1001", title: "Inventario tienda 24", area: "Operaciones", auditor: "D. Ponce",
 *      status: "Abierta", severity: "Alta", createdAt: "2025-05-12", dueAt: "2025-06-10", findings: 7 },
 *  ];
 *  <AuditTable data={data} onRowClick={(r)=>console.log(r)} />
 */

const STATUS_COLORS = {
  Abierta:    "#2563eb",
  "En curso": "#7c3aed",
  Cerrada:    "#16a34a",
  Bloqueada:  "#ef4444",
};

const SEVERITY_COLORS = {
  Baja:  "#16a34a",
  Media: "#f59e0b",
  Alta:  "#ef4444",
  Crítica: "#991b1b",
};

function Badge({ label, color }) {
  const style = {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1.4,
    color: "white",
    backgroundColor: color ?? "#6b7280",
    whiteSpace: "nowrap",
  };
  return <span style={style} aria-label={label}>{label}</span>;
}

Badge.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string,
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (s) =>
    `"${String(s ?? "").replaceAll('"', '""').replaceAll("\n", " ")}"`;
  const out = [headers.join(",")];
  for (const r of rows) {
    out.push(headers.map((h) => esc(r[h])).join(","));
  }
  return out.join("\n");
}

export default function AuditTable({
  data,
  onRowClick,
  onDeleteMany,
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
  emptyState,
}) {
  // ------- estado de filtros/orden/paginación/selección
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [severity, setSeverity] = useState("Todas");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  // reset de página al cambiar filtros
  useEffect(() => setPage(1), [query, status, severity, startDate, endDate, pageSize]);

  const headers = [
    { key: "title", label: "Auditoría", sortable: true },
    { key: "area", label: "Área", sortable: true },
    { key: "auditor", label: "Auditor(a)", sortable: true },
    { key: "status", label: "Estado", sortable: true },
    { key: "severity", label: "Severidad", sortable: true },
    { key: "createdAt", label: "Creada", sortable: true },
    { key: "dueAt", label: "Vence", sortable: true },
    { key: "findings", label: "Hallazgos", sortable: true, align: "right" },
  ];

  const uniqueStatuses = useMemo(() => {
    const s = new Set(data.map((d) => d.status).filter(Boolean));
    return ["Todos", ...Array.from(s)];
  }, [data]);

  const uniqueSeverities = useMemo(() => {
    const s = new Set(data.map((d) => d.severity).filter(Boolean));
    return ["Todas", ...Array.from(s)];
  }, [data]);

  // ------- filtrado
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return data.filter((row) => {
      // texto
      const haystack = [
        row.id,
        row.title,
        row.area,
        row.auditor,
        row.status,
        row.severity,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (q && !haystack.includes(q)) return false;

      // estado
      if (status !== "Todos" && row.status !== status) return false;

      // severidad
      if (severity !== "Todas" && row.severity !== severity) return false;

      // fechas (createdAt dentro de rango)
      if (start || end) {
        const created = new Date(row.createdAt);
        if (Number.isNaN(created.getTime())) return false;
        if (start && created < start) return false;
        if (end) {
          // incluir el día final completo
          const endDay = new Date(end);
          endDay.setHours(23, 59, 59, 999);
          if (created > endDay) return false;
        }
      }

      return true;
    });
  }, [data, query, status, severity, startDate, endDate]);

  // ------- orden
  const sorted = useMemo(() => {
    const { key, dir } = sort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[key];
      const bv = b[key];

      // fechas
      if (key.toLowerCase().includes("date") || key.toLowerCase().includes("at")) {
        const ad = new Date(av);
        const bd = new Date(bv);
        const an = ad.getTime();
        const bn = bd.getTime();
        if (Number.isNaN(an) || Number.isNaN(bn)) {
          return String(av ?? "").localeCompare(String(bv ?? ""));
        }
        return an - bn;
      }

      // numérico
      if (typeof av === "number" && typeof bv === "number") return av - bv;

      // string fallback
      return String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
    if (dir === "desc") copy.reverse();
    return copy;
  }, [filtered, sort]);

  // ------- paginación
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(startIdx, startIdx + pageSize);

  // ------- selección
  const allVisibleIds = pageRows.map((r) => r.id);
  const allVisibleSelected = allVisibleIds.every((id) => selected.has(id));
  const someVisibleSelected = !allVisibleSelected && allVisibleIds.some((id) => selected.has(id));

  function toggleAllVisible() {
    const next = new Set(selected);
    if (allVisibleSelected) {
      allVisibleIds.forEach((id) => next.delete(id));
    } else {
      allVisibleIds.forEach((id) => next.add(id));
    }
    setSelected(next);
  }

  function toggleOne(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleDeleteSelected() {
    const ids = Array.from(selected);
    if (!ids.length || !onDeleteMany) return;
    const ok = window.confirm(`¿Eliminar ${ids.length} auditoría(s) seleccionadas? Esta acción no se puede deshacer.`);
    if (!ok) return;
    await onDeleteMany(ids);
    setSelected(new Set());
  }

  function handleExportCSV(scope = "visible") {
    const rows =
      scope === "selected"
        ? sorted.filter((r) => selected.has(r.id))
        : scope === "all"
        ? sorted
        : pageRows;

    if (!rows.length) return;
    // Solo exportamos columnas visibles
    const mapped = rows.map((r) => ({
      id: r.id,
      title: r.title,
      area: r.area,
      auditor: r.auditor,
      status: r.status,
      severity: r.severity,
      createdAt: r.createdAt,
      dueAt: r.dueAt,
      findings: r.findings,
    }));

    const csv = toCSV(mapped);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `auditorias_${scope}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  }

  // ------- estilos minimos
  const styles = {
    container: { width: "100%", overflowX: "auto" },
    toolbar: {
      display: "grid",
      gap: "0.75rem",
      gridTemplateColumns: "1fr",
      marginBottom: "0.75rem",
    },
    toolbarRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      alignItems: "center",
    },
    input: {
      height: 36,
      padding: "0 10px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
    },
    select: {
      height: 36,
      padding: "0 10px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      background: "white",
    },
    btn: {
      height: 36,
      padding: "0 12px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      background: "white",
      cursor: "pointer",
    },
    btnPrimary: {
      height: 36,
      padding: "0 12px",
      border: "1px solid #2563eb",
      borderRadius: 8,
      background: "#2563eb",
      color: "white",
      cursor: "pointer",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      overflow: "hidden",
    },
    th: {
      textAlign: "left",
      padding: "10px 12px",
      background: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
      fontSize: 14,
      fontWeight: 700,
      whiteSpace: "nowrap",
      userSelect: "none",
      cursor: "pointer",
    },
    td: {
      padding: "10px 12px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: 14,
      verticalAlign: "middle",
    },
    trHover: { cursor: "pointer", background: "#fafafa" },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "0.5rem",
      marginTop: "0.75rem",
      flexWrap: "wrap",
    },
    muted: { color: "#6b7280" },
  };

  return (
    <div>
      {/* Toolbar de filtros */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarRow} role="search">
          <input
            type="search"
            placeholder="Buscar por ID, título, área o auditor…"
            aria-label="Búsqueda"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ ...styles.input, flex: 1, minWidth: 240 }}
          />

          <select
            aria-label="Filtrar por estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.select}
          >
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>
                Estado: {s}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por severidad"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={styles.select}
          >
            {uniqueSeverities.map((s) => (
              <option key={s} value={s}>
                Severidad: {s}
              </option>
            ))}
          </select>

          <input
            type="date"
            aria-label="Fecha inicio (creadas desde)"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
          />
          <input
            type="date"
            aria-label="Fecha fin (creadas hasta)"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.input}
          />

          <select
            aria-label="Tamaño de página"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={styles.select}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} / página
              </option>
            ))}
          </select>
        </div>

        <div style={styles.toolbarRow} aria-label="Acciones masivas">
          <button
            type="button"
            style={styles.btn}
            onClick={() => handleExportCSV("visible")}
            title="Exportar filas visibles a CSV"
          >
            Exportar visibles (CSV)
          </button>
          <button
            type="button"
            style={styles.btn}
            onClick={() => handleExportCSV("all")}
            title="Exportar todo el resultado filtrado"
          >
            Exportar todo (CSV)
          </button>
          <button
            type="button"
            style={{ ...styles.btn, ...(selected.size ? {} : { opacity: 0.6, cursor: "not-allowed" }) }}
            onClick={() => handleExportCSV("selected")}
            disabled={!selected.size}
            title="Exportar seleccionados"
          >
            Exportar seleccionados (CSV)
          </button>
          {onDeleteMany && (
            <button
              type="button"
              style={{
                ...styles.btnPrimary,
                background: "#ef4444",
                borderColor: "#ef4444",
                ...(selected.size ? {} : { opacity: 0.6, cursor: "not-allowed" }),
              }}
              disabled={!selected.size}
              onClick={handleDeleteSelected}
              title="Eliminar seleccionados"
            >
              Eliminar seleccionados
            </button>
          )}
          <span style={{ ...styles.muted, marginLeft: "auto" }}>
            {selected.size
              ? `${selected.size} seleccionada(s)`
              : `${total} resultado(s)`}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div style={styles.container} role="region" aria-label="Tabla de auditorías">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: 42, cursor: "default" }}>
                <input
                  type="checkbox"
                  aria-label="Seleccionar todo en la página"
                  checked={allVisibleSelected}
                  ref={(el) => el && (el.indeterminate = someVisibleSelected)}
                  onChange={toggleAllVisible}
                />
              </th>
              {headers.map((h) => {
                const isActive = sort.key === h.key;
                const arrow = isActive ? (sort.dir === "asc" ? "▲" : "▼") : "⇅";
                return (
                  <th
                    key={h.key}
                    scope="col"
                    style={{ ...styles.th, textAlign: h.align === "right" ? "right" : "left" }}
                    aria-sort={isActive ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    onClick={() => h.sortable && handleSort(h.key)}
                    title={h.sortable ? `Ordenar por ${h.label}` : undefined}
                  >
                    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                      {h.label}
                      {h.sortable && (
                        <span aria-hidden="true" style={{ fontSize: 12, color: "#6b7280" }}>
                          {arrow}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} style={{ ...styles.td, textAlign: "center", padding: 24 }}>
                  {emptyState ?? <span style={styles.muted}>No hay resultados para los filtros aplicados.</span>}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const clickable = typeof onRowClick === "function";
                return (
                  <tr
                    key={row.id}
                    onClick={() => clickable && onRowClick(row)}
                    style={clickable ? styles.trHover : undefined}
                    tabIndex={clickable ? 0 : -1}
                    onKeyDown={(e) => {
                      if (clickable && (e.key === "Enter" || e.key === " ")) onRowClick(row);
                    }}
                    aria-label={`Auditoría ${row.title}`}
                  >
                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar auditoría ${row.id}`}
                        checked={selected.has(row.id)}
                        onChange={() => toggleOne(row.id)}
                      />
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600 }}>{row.title ?? "—"}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{row.id ?? ""}</div>
                    </td>
                    <td style={styles.td}>{row.area ?? "—"}</td>
                    <td style={styles.td}>{row.auditor ?? "—"}</td>
                    <td style={styles.td}>
                      <Badge label={row.status ?? "—"} color={STATUS_COLORS[row.status]}/>
                    </td>
                    <td style={styles.td}>
                      <Badge label={row.severity ?? "—"} color={SEVERITY_COLORS[row.severity]} />
                    </td>
                    <td style={styles.td}>{formatDate(row.createdAt)}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>{formatDate(row.dueAt)}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>{row.findings ?? 0}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <nav aria-label="Paginación" style={styles.footer}>
        <div style={styles.muted}>
          Página {currentPage} de {totalPages}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            style={styles.btn}
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            aria-disabled={currentPage === 1}
            aria-label="Primera página"
            title="Primera página"
          >
            «
          </button>
          <button
            type="button"
            style={styles.btn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-disabled={currentPage === 1}
            aria-label="Página anterior"
            title="Página anterior"
          >
            ‹
          </button>
          <button
            type="button"
            style={styles.btn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-disabled={currentPage === totalPages}
            aria-label="Página siguiente"
            title="Página siguiente"
          >
            ›
          </button>
          <button
            type="button"
            style={styles.btn}
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
            aria-disabled={currentPage === totalPages}
            aria-label="Última página"
            title="Última página"
          >
            »
          </button>
        </div>
      </nav>
    </div>
  );
}

AuditTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id:        PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title:     PropTypes.string,
      area:      PropTypes.string,
      auditor:   PropTypes.string,
      status:    PropTypes.string, // Abierta | En curso | Cerrada | Bloqueada
      severity:  PropTypes.string, // Baja | Media | Alta | Crítica
      createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      dueAt:     PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      findings:  PropTypes.number,
    })
  ).isRequired,
  onRowClick: PropTypes.func,
  onDeleteMany: PropTypes.func,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  initialPageSize: PropTypes.number,
  emptyState: PropTypes.node,
};

/* --- Sugerencia de uso rápido (borra esto en producción) ---
import React from "react";
import AuditTable from "./AuditTable";

const mock = [
  { id: "A-1001", title: "Inventario tienda 24", area: "Operaciones", auditor: "D. Ponce",
    status: "Abierta", severity: "Alta", createdAt: "2025-05-12", dueAt: "2025-06-10", findings: 7 },
  { id: "A-1002", title: "Caja diaria sucursal Centro", area: "Finanzas", auditor: "J. López",
    status: "En curso", severity: "Media", createdAt: "2025-06-01", dueAt: "2025-06-08", findings: 3 },
  { id: "A-1003", title: "Proveedores críticos Q2", area: "Compras", auditor: "M. Silva",
    status: "Cerrada", severity: "Baja", createdAt: "2025-04-18", dueAt: "2025-05-02", findings: 1 },
];

export default function Demo() {
  return (
    <div style={{ padding: 24 }}>
      <h1>AudiconFlow – Auditorías</h1>
      <AuditTable
        data={mock}
        onRowClick={(row) => alert("Abrir detalle: " + row.id)}
        onDeleteMany={(ids) => new Promise((res)=>setTimeout(()=>{ console.log("Eliminar", ids); res(); }, 600))}
      />
    </div>
  );
}
--- fin de ejemplo --- */