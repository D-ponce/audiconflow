import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import AuditService from '../../../services/auditService';

const AuditorWorkspace = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const response = await AuditService.getAudits();
      if (response.success) {
        setAudits(response.audits);
      }
    } catch (error) {
      console.error('Error loading audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAudits = () => {
    if (!audits.length) return [];
    
    let filteredAudits = [];
    
    switch (activeTab) {
      case 'pending':
        filteredAudits = audits.filter(audit => audit.status === 'Pendiente');
        break;
      case 'inProgress':
        filteredAudits = audits.filter(audit => audit.status === 'En Progreso' || audit.status === 'Activa');
        break;
      case 'review':
        filteredAudits = audits.filter(audit => audit.status === 'En Revisión');
        break;
      default:
        filteredAudits = audits;
    }
    
    // Ordenar por fecha de creación (más recientes primero) y limitar a 2
    return filteredAudits
      .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
      .slice(0, 2);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-gray-100 text-gray-800';
      case 'En Progreso': return 'bg-blue-100 text-blue-800';
      case 'Completada': return 'bg-green-100 text-green-800';
      case 'Revisión': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="powerbi-card">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Mi Área de Trabajo</h3>
        </div>
        
        {/* Tab Buttons */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pendientes ({getFilteredAudits().filter(a => a.status === 'Pendiente').length})
          </button>
          <button
            onClick={() => setActiveTab('inProgress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'inProgress'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            En Progreso ({audits.filter(a => a.status === 'En Progreso' || a.status === 'Activa').length})
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'review'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Para Revisión ({audits.filter(a => a.status === 'En Revisión').length})
          </button>
        </div>
      </div>

      {/* Audit List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : getFilteredAudits().length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileX" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay auditorías</h3>
            <p className="text-gray-500">No se encontraron auditorías para esta categoría.</p>
          </div>
        ) : (
          getFilteredAudits().map((audit) => (
            <div key={audit._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm text-primary font-medium">{audit.auditId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(audit.priority)}`}>
                    {audit.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                    {audit.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Icon name="Eye" size={16} />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Icon name="Edit" size={16} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="font-medium">{audit.name || 'Sin nombre'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="font-medium">{audit.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{audit.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimiento</p>
                  <p className="font-medium">{new Date(audit.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

            {/* Progress Bar */}
            {(audit.completionPercentage > 0 || audit.actualHours > 0) && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progreso</span>
                  <span>{audit.completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${audit.completionPercentage || 0}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Icon name="User" size={12} />
                <span>{audit.auditor || 'Sin asignar'}</span>
                <span>•</span>
                <span>Actualizado hace 2h</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                  <Icon name="Play" size={12} className="mr-1" />
                  Continuar
                </button>
                <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-colors">
                  <Icon name="CheckSquare" size={12} className="mr-1" />
                  Checklist
                </button>
              </div>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default AuditorWorkspace;
