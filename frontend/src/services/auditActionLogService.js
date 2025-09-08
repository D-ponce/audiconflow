import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class AuditActionLogService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/audit-logs`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Obtener historial de acciones de una auditoría
  async getAuditHistory(auditId, options = {}) {
    try {
      const { limit = 50, skip = 0, action } = options;
      const params = new URLSearchParams();
      
      if (limit) params.append('limit', limit);
      if (skip) params.append('skip', skip);
      if (action) params.append('action', action);

      const response = await this.apiClient.get(`/${auditId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de auditoría:', error);
      throw error;
    }
  }

  // Obtener estadísticas de acciones de una auditoría
  async getAuditStats(auditId) {
    try {
      const response = await this.apiClient.get(`/${auditId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de auditoría:', error);
      throw error;
    }
  }

  // Registrar una nueva acción
  async logAction(auditId, action, actionBy, details = {}, previousValue = null, newValue = null) {
    try {
      const response = await this.apiClient.post('/', {
        auditId,
        action,
        actionBy,
        details,
        previousValue,
        newValue
      });
      return response.data;
    } catch (error) {
      console.error('Error al registrar acción:', error);
      throw error;
    }
  }

  // Obtener acciones de un usuario específico
  async getUserActions(userId, options = {}) {
    try {
      const { limit = 50, skip = 0, auditId } = options;
      const params = new URLSearchParams();
      
      if (limit) params.append('limit', limit);
      if (skip) params.append('skip', skip);
      if (auditId) params.append('auditId', auditId);

      const response = await this.apiClient.get(`/user/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener acciones del usuario:', error);
      throw error;
    }
  }

  // Formatear fecha para mostrar
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Formatear acción para mostrar
  formatAction(action) {
    const actionMap = {
      'created': 'Creada',
      'updated': 'Actualizada',
      'status_changed': 'Estado Cambiado',
      'assigned': 'Asignada',
      'file_uploaded': 'Archivo Subido',
      'file_processed': 'Archivo Procesado',
      'cross_check_executed': 'Cruce Ejecutado',
      'report_generated': 'Reporte Generado',
      'finding_added': 'Hallazgo Agregado',
      'finding_updated': 'Hallazgo Actualizado',
      'comment_added': 'Comentario Agregado',
      'approval_requested': 'Aprobación Solicitada',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'archived': 'Archivada',
      'deleted': 'Eliminada'
    };
    return actionMap[action] || action;
  }

  // Obtener icono para cada tipo de acción
  getActionIcon(action) {
    const iconMap = {
      'created': 'Plus',
      'updated': 'Edit',
      'status_changed': 'RefreshCw',
      'assigned': 'User',
      'file_uploaded': 'Upload',
      'file_processed': 'FileCheck',
      'cross_check_executed': 'GitMerge',
      'report_generated': 'FileText',
      'finding_added': 'AlertTriangle',
      'finding_updated': 'Edit3',
      'comment_added': 'MessageSquare',
      'approval_requested': 'Clock',
      'approved': 'CheckCircle',
      'rejected': 'XCircle',
      'archived': 'Archive',
      'deleted': 'Trash2'
    };
    return iconMap[action] || 'Activity';
  }

  // Obtener color para cada tipo de acción
  getActionColor(action) {
    const colorMap = {
      'created': 'text-green-600',
      'updated': 'text-blue-600',
      'status_changed': 'text-purple-600',
      'assigned': 'text-indigo-600',
      'file_uploaded': 'text-cyan-600',
      'file_processed': 'text-teal-600',
      'cross_check_executed': 'text-orange-600',
      'report_generated': 'text-amber-600',
      'finding_added': 'text-red-600',
      'finding_updated': 'text-yellow-600',
      'comment_added': 'text-gray-600',
      'approval_requested': 'text-blue-500',
      'approved': 'text-green-500',
      'rejected': 'text-red-500',
      'archived': 'text-gray-500',
      'deleted': 'text-red-700'
    };
    return colorMap[action] || 'text-gray-600';
  }
}

export default new AuditActionLogService();
