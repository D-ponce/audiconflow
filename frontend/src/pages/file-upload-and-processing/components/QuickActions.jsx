import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const QuickActions = ({ onProcessAnother }) => {
  const [crossResults, setCrossResults] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedKey, setSelectedKey] = useState("RUT");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);

  // 🔄 Cargar lista de archivos
  useEffect(() => {
    if (isModalOpen) {
      fetch("http://localhost:5000/api/files")
        .then((res) => res.json())
        .then((data) => setAvailableFiles(data))
        .catch((err) =>
          console.error("❌ Error al obtener archivos para cruzar:", err)
        );
    }
  }, [isModalOpen]);

  // ✅ Toggle selección
  const toggleFileSelection = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  // ✅ Cruce de archivos
  const handleCrossCheck = async () => {
    if (selectedFiles.length < 2) {
      alert("⚠️ Selecciona al menos 2 archivos para cruzar");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/cross-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: selectedFiles, key: selectedKey }),
      });
      const data = await res.json();
      setCrossResults(data);
      setIsModalOpen(false);
    } catch (err) {
      console.error("❌ Error en cruce de información:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Descargar reporte Excel
  const handleDownloadReport = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cross-check/report");
      if (!res.ok) throw new Error("Error al generar reporte");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte_cruce.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("❌ Error al descargar reporte:", err);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Acciones Rápidas
      </h3>

      {/* Botones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Button
          variant="default"
          onClick={onProcessAnother}
          iconName="Plus"
          iconPosition="left"
          fullWidth
        >
          Procesar Otro Archivo
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          iconName="Eye"
          iconPosition="left"
          fullWidth
        >
          Cruce de información
        </Button>

        {crossResults?.results?.length > 0 && (
          <Button
            variant="secondary"
            onClick={handleDownloadReport}
            iconName="Download"
            iconPosition="left"
            fullWidth
          >
            Generar Reporte
          </Button>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl shadow-xl max-w-lg w-full">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="GitMerge" size={18} />
              Selecciona archivos para cruzar
            </h4>

            <div className="max-h-60 overflow-y-auto border border-border rounded-lg p-3 mb-4">
              {availableFiles.length > 0 ? (
                availableFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer mb-2 ${
                      selectedFiles.includes(file.id)
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <span>{file.filename}</span>
                    {selectedFiles.includes(file.id) && (
                      <Icon name="Check" size={16} />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay archivos cargados.
                </p>
              )}
            </div>

            <div className="border p-3 rounded-md mb-4">
              <p className="text-sm font-medium mb-2">Selecciona campo clave:</p>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full border rounded-md px-2 py-1 text-sm"
              >
                <option value="RUT">RUT</option>
                <option value="Correo">Correo</option>
                <option value="ID">ID</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleCrossCheck}
                disabled={loading}
              >
                {loading ? "Cruzando..." : "Cruzar Información"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {crossResults && (
        <div className="mt-6">
          <h4 className="font-semibold text-foreground mb-2">
            Resultados del cruce ({crossResults.results.length} registros)
          </h4>
          <div className="space-y-2 p-3 border rounded-md bg-muted/20 text-sm">
            {crossResults.results.map((r, idx) => (
              <p key={idx}>
                {`${selectedKey}: ${r.valor} → ${r.resultado} ${
                  r.archivos ? `(Archivos: ${r.archivos.join(", ")})` : ""
                }`}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
