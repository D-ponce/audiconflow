import React, { useEffect, useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const ProcessingStatus = ({ selectedFileId }) => {
  const [processingResults, setProcessingResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!selectedFileId) return;

    const processFile = async () => {
      setIsProcessing(true);
      try {
        const res = await fetch(`http://localhost:5000/api/process/${selectedFileId}`);
        const data = await res.json();
        setProcessingResults(data);
      } catch (err) {
        console.error("❌ Error en procesamiento:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    processFile();
  }, [selectedFileId]);

  if (!isProcessing && !processingResults) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold flex items-center space-x-2">
        <Icon name="Activity" size={18} />
        <span>Estado del Procesamiento</span>
      </h3>

      {isProcessing && (
        <div className="flex items-center space-x-2 mt-4 text-sm text-muted-foreground">
          <Icon name="Loader" className="animate-spin" size={18} />
          <span>Procesando archivo...</span>
        </div>
      )}

      {processingResults && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Registros Importados: {processingResults.importedRecords}
          </p>
          <p className="text-sm text-muted-foreground">
            Advertencias: {processingResults.warnings}
          </p>
          <p className="text-sm text-muted-foreground">
            Errores: {processingResults.errors}
          </p>

          <Button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4"
          >
            {showDetails ? "Ocultar Resultados" : "Ver Resultados"}
          </Button>

          {/* 📌 Tabla con los datos extraídos */}
          {showDetails && processingResults.rows && (
            <div className="mt-6 overflow-x-auto max-h-96 border border-border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {Object.keys(processingResults.rows[0] || {}).map((col, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-2 text-left font-medium text-foreground border-b"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processingResults.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      {Object.values(row).map((val, i) => (
                        <td
                          key={i}
                          className="px-4 py-2 border-b text-muted-foreground"
                        >
                          {val !== undefined && val !== null ? val.toString() : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
