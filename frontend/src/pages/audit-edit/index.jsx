import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AuditEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auditId } = useParams();
  
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    auditId: '',
    type: '',
    location: '',
    auditor: '',
    startDate: '',
    completionDate: '',
    status: 'pendiente',
    description: '',
    priority: 'media'
  });

  useEffect(() => {
    // Si viene del state (desde la tabla), usar esos datos
    if (location.state?.auditData) {
      const auditData = location.state.auditData;
      setAudit(auditData);
      setFormData({
        auditId: auditData.auditId || '',
        type: auditData.type || '',
        location: auditData.location || '',
        auditor: auditData.auditor || '',
        startDate: auditData.startDate ? auditData.startDate.split('T')[0] : '',
        completionDate: auditData.completionDate ? auditData.completionDate.split('T')[0] : '',
        status: auditData.status || 'pendiente',
        description: auditData.description || '',
        priority: auditData.priority || 'media'
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
        const auditData = await response.json();
        setAudit(auditData);
        setFormData({
          auditId: auditData.auditId || '',
          type: auditData.type || '',
          location: auditData.location || '',
          auditor: auditData.auditor || '',
          startDate: auditData.startDate ? auditData.startDate.split('T')[0] : '',
          completionDate: auditData.completionDate ? auditData.completionDate.split('T')[0] : '',
          status: auditData.status || 'pendiente',
          description: auditData.description || '',
          priority: auditData.priority || 'media'
        });
      } else {
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
      const response = await fetch(`http://localhost:5000/api/audits/${audit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Auditoría actualizada correctamente');
        navigate('/audit-records-management');
      } else {
        alert('Error al actualizar la auditoría');
      }
    } catch (error) {
      console.error('Error updating audit:', error);
      alert('Error al actualizar la auditoría');
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
                      <option value="pendiente">Pendiente</option>
                      <option value="en-progreso">En Progreso</option>
                      <option value="completada">Completada</option>
                      <option value="revision">En Revisión</option>
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
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
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
