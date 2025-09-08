import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Activity, 
  ChevronDown, 
  ChevronUp,
  Filter,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import auditActionLogService from '../services/auditActionLogService';

const AuditActionHistory = ({ auditId, isVisible = true }) => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showDetails, setShowDetails] = useState({});

  useEffect(() => {
    if (auditId && isVisible) {
      fetchAuditHistory();
      fetchAuditStats();
    }
  }, [auditId, isVisible, filter]);

  const fetchAuditHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const options = filter !== 'all' ? { action: filter } : {};
      const response = await auditActionLogService.getAuditHistory(auditId, options);
      setHistory(response.logs || []);
    } catch (err) {
      setError('Error al cargar el historial de acciones');
      console.error('Error fetching audit history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const response = await auditActionLogService.getAuditStats(auditId);
      setStats(response.stats || {});
    } catch (err) {
      console.error('Error fetching audit stats:', err);
    }
  };

  const toggleDetails = (logId) => {
    setShowDetails(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const getActionIcon = (action) => {
    const IconComponent = require('lucide-react')[auditActionLogService.getActionIcon(action)] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const renderActionDetails = (log) => {
    if (!log.details) return null;

    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(log.details).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
              </span>
              <span className="text-gray-800">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </span>
            </div>
          ))}
        </div>
        
        {(log.previousValue || log.newValue) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h5 className="font-medium text-gray-700 mb-2">Cambios realizados:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {log.previousValue && (
                <div>
                  <span className="text-red-600 font-medium">Valor anterior:</span>
                  <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.previousValue, null, 2)}
                  </pre>
                </div>
              )}
              {log.newValue && (
                <div>
                  <span className="text-green-600 font-medium">Valor nuevo:</span>
                  <pre className="mt-1 p-2 bg-green-50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.newValue, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Acciones
            </h3>
            {stats && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {stats.totalActions} acciones
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las acciones</option>
              <option value="created">Creación</option>
              <option value="updated">Actualización</option>
              <option value="status_changed">Cambio de estado</option>
              <option value="assigned">Asignación</option>
              <option value="file_uploaded">Subida de archivos</option>
              <option value="report_generated">Generación de reportes</option>
            </select>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando historial...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">{error}</div>
              <button
                onClick={fetchAuditHistory}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Reintentar
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay acciones registradas para esta auditoría
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((log) => (
                <div key={log._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${auditActionLogService.getActionColor(log.action).replace('text-', 'bg-').replace('-600', '-100')}`}>
                        <div className={auditActionLogService.getActionColor(log.action)}>
                          {getActionIcon(log.action)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {auditActionLogService.formatAction(log.action)}
                          </h4>
                          <span className="text-sm text-gray-500">
                            por {log.actionBy}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{auditActionLogService.formatDate(log.timestamp)}</span>
                          </div>
                          {log.metadata?.ipAddress && (
                            <div className="flex items-center space-x-1">
                              <span>IP: {log.metadata.ipAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {(log.details || log.previousValue || log.newValue) && (
                      <button
                        onClick={() => toggleDetails(log._id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title={showDetails[log._id] ? 'Ocultar detalles' : 'Ver detalles'}
                      >
                        {showDetails[log._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  
                  {showDetails[log._id] && renderActionDetails(log)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditActionHistory;
