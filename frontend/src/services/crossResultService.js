import axios from 'axios';
import reportService from './reportService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:50001/api';

class CrossResultService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/cross-results`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token de autenticación si existe
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Guardar resultado de cruce en la base de datos
   * @param {Object} crossData - Datos del cruce a guardar
   * @returns {Promise} Respuesta de la API
   */
  async saveCrossResult(crossData) {
    try {
      const response = await this.apiClient.post('/', crossData);
      console.log('✅ Resultado de cruce guardado exitosamente:', response.data);
      
      // Crear reporte automáticamente después de guardar el resultado del cruce
      const reportResponse = await this.createReportFromCrossResult(response.data);
      if (reportResponse) {
        console.log('✅ Reporte creado automáticamente:', reportResponse.data.name);
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Resultado de cruce guardado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error al guardar resultado de cruce:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar resultado de cruce',
        error: error.response?.data || error.message
      };
    }
  }

  async createReportFromCrossResult(crossResult) {
    try {
      const reportData = {
        name: `Reporte de Cruce - ${crossResult.keyField} vs ${crossResult.resultField}`,
        description: `Reporte generado automáticamente del cruce de información entre ${crossResult.keyField} y ${crossResult.resultField}`,
        category: 'Cruce de Datos',
        type: 'cross_result',
        auditId: crossResult.auditId,
        crossResultId: crossResult.crossId,
        createdBy: crossResult.executedBy || 'Sistema',
        format: 'html',
        data: {
          crossResult: crossResult,
          summary: crossResult.summary,
          executionDetails: crossResult.executionDetails
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          source: 'cross_result_auto_generation',
          keyField: crossResult.keyField,
          resultField: crossResult.resultField,
          totalRecords: crossResult.results?.length || 0
        }
      };

      const response = await reportService.createReport(reportData);
      
      if (response.success) {
        console.log('✅ Reporte creado automáticamente:', response.data.name);
        
        // Actualizar historial de archivos con el resultado del cruce
        await this.updateFileHistoryWithCrossResult(crossResult);
        
        return response;
      } else {
        console.error('❌ Error al crear reporte automático:', response.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error inesperado al crear reporte automático:', error);
      return null;
    }
  }

  async updateFileHistoryWithCrossResult(crossResult) {
    try {
      // Importar el servicio de historial de archivos
      const { default: fileUploadHistoryService } = await import('./fileUploadHistoryService.js');
      
      // Obtener historial de archivos de la auditoría
      const history = await fileUploadHistoryService.getHistoryByAudit(crossResult.auditId);
      
      // Buscar archivos relacionados con este cruce
      const relatedFiles = history.filter(record => 
        crossResult.processedFiles?.some(pf => 
          pf.filename === record.fileName || pf.originalName === record.originalName
        )
      );

      // Actualizar cada archivo relacionado con el resultado del cruce
      for (const fileRecord of relatedFiles) {
        const crossResultData = {
          crossId: crossResult.crossId,
          keyField: crossResult.keyField,
          resultField: crossResult.resultField,
          matchCount: crossResult.summary?.matches || 0,
          totalRecords: crossResult.summary?.totalRecords || 0
        };

        await fileUploadHistoryService.addCrossResult(fileRecord._id, crossResultData);
      }

      console.log('✅ Historial de archivos actualizado con resultado de cruce');
    } catch (error) {
      console.error('❌ Error al actualizar historial de archivos:', error);
    }
  }

  /**
   * Obtener resultados de cruce por auditoría
   * @param {string} auditId - ID de la auditoría
   * @param {Object} options - Opciones de paginación
   * @returns {Promise} Lista de resultados de cruce
   */
  async getCrossResultsByAudit(auditId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const response = await this.apiClient.get(`/${auditId}`, {
        params: { page, limit }
      });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error al obtener resultados de cruce:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener resultados de cruce',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Obtener detalle de un resultado de cruce específico
   * @param {string} crossId - ID del cruce
   * @returns {Promise} Detalle del resultado de cruce
   */
  async getCrossResultDetail(crossId) {
    try {
      const response = await this.apiClient.get(`/detail/${crossId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error al obtener detalle de cruce:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener detalle de cruce',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Obtener estadísticas de cruces por auditoría
   * @param {string} auditId - ID de la auditoría
   * @returns {Promise} Estadísticas de cruces
   */
  async getCrossStats(auditId) {
    try {
      const response = await this.apiClient.get(`/stats/${auditId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de cruce:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estadísticas de cruce',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Actualizar resultado de cruce
   * @param {string} crossId - ID del cruce
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise} Resultado actualizado
   */
  async updateCrossResult(crossId, updates) {
    try {
      const response = await this.apiClient.put(`/${crossId}`, updates);
      return {
        success: true,
        data: response.data.data,
        message: 'Resultado de cruce actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error al actualizar resultado de cruce:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar resultado de cruce',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Eliminar resultado de cruce
   * @param {string} crossId - ID del cruce
   * @returns {Promise} Confirmación de eliminación
   */
  async deleteCrossResult(crossId) {
    try {
      const response = await this.apiClient.delete(`/${crossId}`);
      return {
        success: true,
        message: 'Resultado de cruce eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar resultado de cruce:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar resultado de cruce',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Formatear datos de cruce para envío a la API
   * @param {Object} reportData - Datos del reporte de cruce
   * @param {string} auditId - ID de la auditoría
   * @param {string} executedBy - Usuario que ejecutó el cruce
   * @returns {Object} Datos formateados para la API
   */
  formatCrossDataForAPI(reportData, auditId, executedBy) {
    if (!reportData || !reportData.results) {
      throw new Error('Datos de cruce inválidos');
    }

    return {
      auditId,
      keyField: reportData.keyField || 'RUT',
      resultField: reportData.resultField || 'Tipo de cuenta',
      processedFiles: reportData.processedFiles || [],
      results: reportData.results.map(result => ({
        keyValue: result.rut || result.key,
        resultValue: result.tipoCuenta || result.value,
        status: result.estado || result.status,
        sourceFiles: result.archivos || result.files || [],
        metadata: {
          originalData: result
        }
      })),
      executedBy
    };
  }
}

// Crear instancia singleton del servicio
const crossResultService = new CrossResultService();

export default crossResultService;
