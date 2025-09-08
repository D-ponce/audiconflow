import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  BarChart3, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';

const AuditReportsSection = ({ auditId, isVisible = true }) => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (auditId && isVisible) {
      fetchAuditReports();
    }
  }, [auditId, isVisible]);

  const fetchAuditReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/reports/audit/${auditId}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports || []);
        setStats(data.stats || {});
      } else {
        setError(data.message || 'Error al cargar reportes');
      }
    } catch (err) {
      setError('Error de conexión al cargar reportes');
      console.error('Error fetching audit reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewReport = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`);
      const data = await response.json();
      setSelectedReport(data);
      setShowReportModal(true);
    } catch (err) {
      console.error('Error loading report details:', err);
    }
  };

  const downloadReport = async (report) => {
    try {
      // Crear contenido del reporte para descarga
      const reportContent = {
        name: report.name,
        description: report.description,
        auditInfo: report.auditInfo,
        createdAt: report.createdAt,
        createdBy: report.createdBy,
        data: report.data || {}
      };

      const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'cross_result':
        return <BarChart3 className="w-5 h-5 text-blue-600" />;
      case 'analysis':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'summary':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'cross_analysis':
        return 'bg-blue-100 text-blue-800';
      case 'performance':
        return 'bg-green-100 text-green-800';
      case 'compliance':
        return 'bg-yellow-100 text-yellow-800';
      case 'findings':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Reportes y Análisis
            </h3>
            {stats && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {stats.total} reportes
              </span>
            )}
          </div>
          <button
            onClick={fetchAuditReports}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando reportes...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={fetchAuditReports}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No hay reportes generados para esta auditoría</p>
            <p className="text-sm mt-1">Los reportes se generan automáticamente al realizar cruces de información</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Estadísticas rápidas */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Total Reportes</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">Total Vistas</p>
                      <p className="text-2xl font-bold text-green-600">{stats.totalViews}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-900">Análisis de Cruce</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.byType?.cross_result || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de reportes */}
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getReportIcon(report.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
                            {report.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(report.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{report.createdBy}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{report.views || 0} vistas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewReport(report._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Ver reporte"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadReport(report)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Descargar reporte"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Información adicional del cruce si existe */}
                  {report.crossResultId && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2 text-sm">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Cruce de información:</span>
                        <span>{report.crossResultId.keyField} → {report.crossResultId.resultField}</span>
                        <span className="ml-auto text-green-600 font-medium">
                          {report.crossResultId.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal para ver detalles del reporte */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedReport.name}</h2>
                  <p className="text-gray-600">{selectedReport.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {selectedReport.data && (
                <div className="space-y-4">
                  {selectedReport.data.summary && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-3">Resumen del Análisis</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedReport.data.summary.totalRecords}
                          </div>
                          <div className="text-sm text-blue-800">Total Registros</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedReport.data.summary.matchedRecords}
                          </div>
                          <div className="text-sm text-green-800">Coincidencias</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {selectedReport.data.summary.unmatchedRecords}
                          </div>
                          <div className="text-sm text-red-800">Sin Coincidencia</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {selectedReport.data.summary.matchPercentage}%
                          </div>
                          <div className="text-sm text-purple-800">% Coincidencia</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Datos Completos del Reporte</h3>
                    <pre className="text-sm text-gray-600 overflow-x-auto">
                      {JSON.stringify(selectedReport.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditReportsSection;
