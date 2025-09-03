import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AuditService from '../../services/auditService';

const AuditEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auditId } = useParams();
  
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    auditId: '',
    type: '',
    location: '',
    auditor: '',
    startDate: '',
    completionDate: '',
    dueDate: '',
    status: 'En Progreso',
    description: '',
    priority: 'Media'
  });

  // Obtener rol del usuario desde localStorage
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const session = localStorage.getItem("audiconflow_session");
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        setUserRole(sessionData.role);
      } catch (error) {
        setUserRole(null);
      }
    }
  }, []);

  useEffect(() => {
    // Si viene del state (desde la tabla), usar esos datos
    if (location.state?.auditData) {
      const auditData = location.state.auditData;
      setAudit(auditData);
      setFormData({
        name: auditData.name || '',
        auditId: auditData.auditId || '',
        type: auditData.type || '',
        location: auditData.location || '',
        auditor: auditData.auditor || '',
        startDate: auditData.startDate ? auditData.startDate.split('T')[0] : '',
        completionDate: auditData.completionDate ? auditData.completionDate.split('T')[0] : '',
        dueDate: auditData.dueDate ? auditData.dueDate.split('T')[0] : '',
        status: auditData.originalStatus || auditData.status || 'En Progreso',
        description: auditData.description || '',
        priority: auditData.priority || 'Media'
      });
      setLoading(false);
    } else if (auditId) {
      // Si viene por URL, cargar los datos de la auditoría
      loadAuditData(auditId);
    } else {
      // No hay datos suficientes, redirigir
      navigate('/audit-records-management');
    }
  }, [location.state, auditId, navigate]);

  const loadAuditData = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/audits/${id}`);
      if (response.ok) {
        const data = await response.json();
        const auditData = data.audit || data; // Manejar diferentes formatos de respuesta
        setAudit(auditData);
        setFormData({
          name: auditData.name || '',
          auditId: auditData.auditId || '',
          type: auditData.type || '',
          location: auditData.location || '',
          auditor: auditData.auditor || '',
          startDate: auditData.startDate ? auditData.startDate.split('T')[0] : '',
          completionDate: auditData.completionDate ? auditData.completionDate.split('T')[0] : '',
          dueDate: auditData.dueDate ? auditData.dueDate.split('T')[0] : '',
          status: auditData.status || 'En Progreso',
          description: auditData.description || '',
          priority: auditData.priority || 'Media'
        });
      } else {
        console.error('Error loading audit: Response not ok');
        navigate('/audit-records-management');
      }
    } catch (error) {
      console.error('Error loading audit:', error);
      navigate('/audit-records-management');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Usar el _id de MongoDB o el auditId como fallback
      const auditIdentifier = audit._id || audit.auditId || formData.auditId;
      console.log('Intentando actualizar auditoría con ID:', auditIdentifier);
      console.log('Datos del audit completo:', audit);
      
      // Usar AuditService para mantener consistencia con el resto de la aplicación
      const response = await AuditService.updateAudit(auditIdentifier, formData);
      
      console.log('Auditoría actualizada exitosamente:', response);
      
      // Mostrar notificación de éxito
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      notification.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        ✅ Auditoría ${formData.auditId} actualizada exitosamente
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
      
      // Navegar de vuelta a la lista de auditorías
      navigate('/audit-records-management');
      
    } catch (error) {
      console.error('Error updating audit:', error);
      
      // Mostrar notificación de error
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      errorNotification.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        ❌ Error al actualizar la auditoría: ${error.message || 'Error desconocido'}
      `;
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
      }, 7000);
      
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/audit-records-management');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Cargando auditoría...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="hover:bg-white/50"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Auditoría</h1>
              <p className="text-gray-600 mt-1">Modifica los datos de la auditoría {formData.auditId}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Básica */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Icon name="Info" size={20} className="mr-2 text-primary" />
                  Información Básica
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Auditoría *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="Nombre descriptivo de la auditoría"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID de Auditoría *
                    </label>
                    <input
                      type="text"
                      value={formData.auditId}
                      onChange={(e) => handleInputChange('auditId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Auditoría *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Inventario">Auditoría de Inventario</option>
                      <option value="Financiera">Auditoría Financiera</option>
                      <option value="Operacional">Auditoría Operacional</option>
                      <option value="Cumplimiento">Auditoría de Cumplimiento</option>
                      <option value="Seguridad">Auditoría de Seguridad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auditor Asignado *
                    </label>
                    <input
                      type="text"
                      value={formData.auditor}
                      onChange={(e) => handleInputChange('auditor', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Fechas y Estado */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Icon name="Calendar" size={20} className="mr-2 text-primary" />
                  Fechas y Estado
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Límite
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Finalización
                    </label>
                    <input
                      type="date"
                      value={formData.completionDate}
                      onChange={(e) => handleInputChange('completionDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    >
                      <option value="En Progreso">En Progreso</option>
                      <option value="En Revisión">En Revisión</option>
                      <option value="Completada">Completada</option>
                      <option value="Pendiente Aprobación">Pendiente Aprobación</option>
                      {/* Estados solo disponibles para supervisores */}
                      {userRole === "supervisor" && (
                        <>
                          <option value="Aprobada">Aprobada</option>
                          <option value="Rechazada">Rechazada</option>
                          <option value="Archivada">Archivada</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridad
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Icon name="FileText" size={20} className="mr-2 text-primary" />
                  Descripción
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de la Auditoría
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Descripción detallada de la auditoría..."
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-3"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={saving}
                  className="px-6 py-3 bg-primary hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Icon name="Loader" size={16} className="animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" size={16} className="mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditEdit;
