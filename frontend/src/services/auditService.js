const API_BASE_URL = 'http://localhost:50001/api';

class AuditService {
  // Create new audit - ALWAYS uses real backend
  static async createAudit(auditData) {
    try {
      const response = await fetch(`${API_BASE_URL}/audits/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: auditData.name,
          type: auditData.type,
          location: auditData.location,
          priority: auditData.priority,
          dueDate: auditData.dueDate,
          auditor: auditData.auditor,
          description: auditData.description,
          createdBy: auditData.createdBy || 'Usuario'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear auditoría');
      }

      return data;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  }

  // Get all audits
  static async getAudits(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.auditor) queryParams.append('auditor', filters.auditor);

      const url = `${API_BASE_URL}/audits${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener auditorías');
      }

      return data;
    } catch (error) {
      console.error('Error fetching audits:', error);
      throw error;
    }
  }

  // Update audit
  static async updateAudit(auditId, auditData) {
    try {
      const response = await fetch(`${API_BASE_URL}/audits/${auditId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar auditoría');
      }

      return data;
    } catch (error) {
      console.error('Error updating audit:', error);
      throw error;
    }
  }

  // Delete audit
  static async deleteAudit(auditId) {
    try {
      const response = await fetch(`${API_BASE_URL}/audits/${auditId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar auditoría');
      }

      return data;
    } catch (error) {
      console.error('Error deleting audit:', error);
      throw error;
    }
  }

  // Get audit statistics
  static async getAuditStats() {
    try {
      console.log('🔗 Fetching stats from:', `${API_BASE_URL}/audits/stats/summary`);
      const response = await fetch(`${API_BASE_URL}/audits/stats/summary`);
      const data = await response.json();
      
      console.log('📊 Raw stats response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching audit stats:', error);
      // Return mock data if backend is not available
      return {
        success: true,
        stats: {
          total: 0,
          active: 0,
          completed: 0,
          pending: 0,
          'pendiente-aprobacion': 0,
          aprobada: 0,
          rechazada: 0,
          archivada: 0
        }
      };
    }
  }
}

export default AuditService;