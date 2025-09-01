import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import NewAuditModal from './NewAuditModal';
import AuditService from '../../../services/auditService';

const AuditToolbar = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);

  const handleNewAudit = async (auditData) => {
    try {
      const response = await AuditService.createAudit(auditData);
      console.log('Auditoría creada exitosamente:', response.audit);
      
      // Show success notification with better UX
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      notification.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        ✅ Auditoría ${response.audit.auditId} creada exitosamente
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 5000);
      
    } catch (error) {
      console.error('Error al crear auditoría:', error);
      throw error;
    }
  };

  const quickActions = [
    {
      name: 'Nueva Auditoría',
      icon: 'Play',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Comenzar nueva auditoría'
    },
    {
      name: 'Subir Evidencia',
      icon: 'Upload',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Cargar documentos y fotos'
    },
    {
      name: 'Generar Reporte',
      icon: 'FileText',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Crear reporte de auditoría'
    },
    {
      name: 'Checklist',
      icon: 'CheckSquare',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Ver lista de verificación'
    }
  ];

  const filters = [
    { key: 'all', label: 'Todas', count: 64 },
    { key: 'pending', label: 'Pendientes', count: 12 },
    { key: 'active', label: 'Activas', count: 8 },
    { key: 'review', label: 'Revisión', count: 3 },
    { key: 'completed', label: 'Completadas', count: 41 }
  ];

  return (
    <div className="powerbi-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Herramientas de Auditoría</h3>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                if (action.name === 'Nueva Auditoría') {
                  setShowNewAuditModal(true);
                }
              }}
              className={`${action.color} text-white p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg transform hover:-translate-y-1 group`}
              title={action.description}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Icon name={action.icon} size={28} />
                </div>
                <span className="text-sm font-semibold text-center">{action.name}</span>
                <span className="text-xs opacity-80 text-center">{action.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <Icon name="Filter" size={16} className="mr-2" />
            Filtrar Auditorías
          </p>
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                  activeFilter === filter.key
                    ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {filter.label}
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold ${
                  activeFilter === filter.key 
                    ? 'bg-white/20 text-white' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Icon name="Search" size={16} className="mr-2" />
            Búsqueda Rápida
          </p>
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="🔍 Buscar por cliente, ID, ubicación o auditor..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* New Audit Modal */}
      <NewAuditModal
        isOpen={showNewAuditModal}
        onClose={() => setShowNewAuditModal(false)}
        onSubmit={handleNewAudit}
      />
    </div>
  );
};

export default AuditToolbar;
