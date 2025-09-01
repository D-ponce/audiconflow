import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const NewAuditModal = ({ isOpen, onClose, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    priority: 'Media',
    dueDate: '',
    auditor: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la auditoría es requerido';
    }
    
    if (!formData.type.trim()) {
      newErrors.type = 'El tipo de auditoría es requerido';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es requerida';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'La fecha de vencimiento no puede ser anterior a hoy';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      setFormData({
        name: '',
        type: '',
        location: '',
        priority: 'Media',
        dueDate: '',
        auditor: '',
        description: ''
      });
      setErrors({});
      onClose();
      
      // Navegar a la página de registros después de crear la auditoría
      navigate('/audit-records-management');
    } catch (error) {
      console.error('Error al crear auditoría:', error);
      setErrors({ submit: error.message || 'Error al crear la auditoría' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        type: '',
        location: '',
        priority: 'Media',
        dueDate: '',
        auditor: '',
        description: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">✨ Nueva Auditoría</h2>
              <p className="text-blue-100 text-sm mt-1">Completa los datos para crear una nueva auditoría</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre de Auditoría */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              📝 Nombre de la Auditoría *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Auditoría de Inventario Q4 2024, Revisión Financiera Mensual"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm flex items-center"><Icon name="AlertCircle" size={16} className="mr-1" />{errors.name}</p>}
          </div>

          {/* Tipo de Auditoría */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              🔍 Tipo de Auditoría *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.type ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Selecciona el tipo de auditoría</option>
              <option value="Inventario">📦 Inventario</option>
              <option value="Financiera">💰 Financiera</option>
              <option value="Compliance">📋 Compliance</option>
              <option value="Operacional">⚙️ Operacional</option>
              <option value="Calidad">⭐ Calidad</option>
              <option value="Seguridad">🔒 Seguridad</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm flex items-center"><Icon name="AlertCircle" size={16} className="mr-1" />{errors.type}</p>}
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              📍 Ubicación *
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.location ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Selecciona una ubicación</option>
              <option value="Casa Matriz">🏢 Casa Matriz</option>
              <option value="Centro de distribución S">📦 Centro de distribución S</option>
              <option value="Centro de Distribución P">🚛 Centro de Distribución P</option>
              <option value="Locales">🏪 Locales</option>
              <option value="Tiendas">🛒 Tiendas</option>
            </select>
            {errors.location && <p className="text-red-500 text-sm flex items-center"><Icon name="AlertCircle" size={16} className="mr-1" />{errors.location}</p>}
          </div>

          {/* Prioridad y Fecha en una fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prioridad */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                🚨 Prioridad
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all"
                disabled={isSubmitting}
              >
                <option value="Baja">🟢 Baja</option>
                <option value="Media">🟡 Media</option>
                <option value="Alta">🔴 Alta</option>
              </select>
            </div>

            {/* Fecha de Vencimiento */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                📅 Fecha Límite *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.dueDate ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.dueDate && <p className="text-red-500 text-sm flex items-center"><Icon name="AlertCircle" size={16} className="mr-1" />{errors.dueDate}</p>}
            </div>
          </div>

          {/* Auditor Asignado */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              👤 Auditor Responsable
            </label>
            <input
              type="text"
              name="auditor"
              value={formData.auditor}
              onChange={handleInputChange}
              placeholder="Nombre del auditor que realizará la auditoría"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              📝 Descripción Adicional
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe el objetivo, alcance o detalles específicos de esta auditoría..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Error de envío */}
          {errors.submit && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex items-center">
                <Icon name="AlertTriangle" size={20} className="text-red-400 mr-3" />
                <p className="text-red-700 font-medium">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all font-medium shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Icon name="Plus" size={20} className="mr-2" />
                  Crear Auditoría
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAuditModal;
