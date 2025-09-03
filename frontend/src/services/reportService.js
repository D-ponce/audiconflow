import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ReportService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/reports`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Obtener todos los reportes
  async getAllReports(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.createdBy) {
        params.append('createdBy', filters.createdBy);
      }
      if (filters.type) {
        params.append('type', filters.type);
      }
      if (filters.auditId) {
        params.append('auditId', filters.auditId);
      }

      const response = await this.apiClient.get(`/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      throw error;
    }
  }

  // Obtener reporte específico
  async getReportById(reportId) {
    try {
      const response = await this.apiClient.get(`/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte:', error);
      throw error;
    }
  }

  // Crear nuevo reporte
  async createReport(reportData) {
    try {
      const response = await this.apiClient.post('/', reportData);
      return response.data;
    } catch (error) {
      console.error('Error al crear reporte:', error);
      throw error;
    }
  }

  // Crear reporte desde resultado de cruce
  async createReportFromCrossResult(data) {
    try {
      const response = await this.apiClient.post('/from-cross-result', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear reporte desde resultado de cruce:', error);
      throw error;
    }
  }

  // Actualizar reporte
  async updateReport(reportId, updateData) {
    try {
      const response = await this.apiClient.put(`/${reportId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
      throw error;
    }
  }

  // Eliminar reporte
  async deleteReport(reportId) {
    try {
      const response = await this.apiClient.delete(`/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      throw error;
    }
  }

  // Obtener estadísticas de reportes por auditoría
  async getReportStats(auditId) {
    try {
      const response = await this.apiClient.get(`/stats/${auditId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de reportes:', error);
      throw error;
    }
  }

  // Formatear fecha para mostrar
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Formatear tamaño de archivo
  formatFileSize(sizeString) {
    return sizeString || '0 KB';
  }

  // Obtener color de categoría
  getCategoryColor(category) {
    const colors = {
      'Cumplimiento': 'bg-emerald-100 text-emerald-700',
      'Recursos Humanos': 'bg-blue-100 text-blue-700',
      'Operaciones': 'bg-purple-100 text-purple-700',
      'Financiero': 'bg-amber-100 text-amber-700',
      'Inventario': 'bg-cyan-100 text-cyan-700',
      'Cruce de Datos': 'bg-indigo-100 text-indigo-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  }

  // Obtener icono según formato
  getFormatIcon(format) {
    const icons = {
      'PDF': 'FileText',
      'Excel': 'FileSpreadsheet',
      'PowerPoint': 'Presentation',
      'CSV': 'Database',
      'JSON': 'Code'
    };
    return icons[format] || 'File';
  }
}

export default new ReportService();
