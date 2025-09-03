import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:50001/api';

class FileUploadHistoryService {
  constructor() {
    this.apiUrl = `${API_BASE_URL}/file-history`;
  }

  // Obtener historial de archivos por auditoría
  async getHistoryByAudit(auditId) {
    try {
      const response = await axios.get(`${this.apiUrl}/${auditId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de archivos:', error);
      throw error;
    }
  }

  // Crear registro de carga de archivo
  async createUploadRecord(uploadData) {
    try {
      const response = await axios.post(this.apiUrl, uploadData);
      return response.data;
    } catch (error) {
      console.error('Error al crear registro de carga:', error);
      throw error;
    }
  }

  // Actualizar estado de procesamiento
  async updateProcessingStatus(historyId, status, results = null) {
    try {
      const response = await axios.put(`${this.apiUrl}/${historyId}/processing`, {
        status,
        results
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado de procesamiento:', error);
      throw error;
    }
  }

  // Agregar resultado de cruce
  async addCrossResult(historyId, crossResult) {
    try {
      const response = await axios.post(`${this.apiUrl}/${historyId}/cross-result`, {
        crossResult
      });
      return response.data;
    } catch (error) {
      console.error('Error al agregar resultado de cruce:', error);
      throw error;
    }
  }

  // Obtener estadísticas de archivos por auditoría
  async getStatsByAudit(auditId) {
    try {
      const response = await axios.get(`${this.apiUrl}/stats/${auditId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de archivos:', error);
      throw error;
    }
  }

  // Eliminar registro de historial
  async deleteHistoryRecord(historyId) {
    try {
      const response = await axios.delete(`${this.apiUrl}/${historyId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar registro de historial:', error);
      throw error;
    }
  }

  // Formatear tamaño de archivo
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Formatear fecha
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener color por estado
  getStatusColor(status) {
    const colors = {
      uploaded: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      processed: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Obtener texto de estado en español
  getStatusText(status) {
    const texts = {
      uploaded: 'Cargado',
      processing: 'Procesando',
      processed: 'Procesado',
      error: 'Error'
    };
    return texts[status] || status;
  }
}

export default new FileUploadHistoryService();
