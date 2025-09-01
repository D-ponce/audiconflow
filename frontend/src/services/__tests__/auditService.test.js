import AuditService from '../auditService';

// Mock fetch globally
global.fetch = jest.fn();

describe('AuditService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('createAudit', () => {
    test('successfully creates audit', async () => {
      const mockAuditData = {
        name: 'Test Audit',
        type: 'Inventario',
        location: 'Almacén A',
        priority: 'Alta',
        dueDate: '2024-12-31',
        auditor: 'Test Auditor',
        description: 'Test description'
      };

      const mockResponse = {
        success: true,
        message: 'Auditoría creada exitosamente',
        audit: { auditId: 'AUD-123', ...mockAuditData }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AuditService.createAudit(mockAuditData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/audits/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...mockAuditData,
            createdBy: 'Usuario'
          })
        }
      );

      expect(result).toEqual(mockResponse);
    });

    test('handles creation error', async () => {
      const mockAuditData = {
        name: 'Test Audit',
        type: 'Inventario'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Campos requeridos faltantes'
        })
      });

      await expect(AuditService.createAudit(mockAuditData))
        .rejects.toThrow('Campos requeridos faltantes');
    });

    test('handles network error', async () => {
      const mockAuditData = {
        name: 'Test Audit',
        type: 'Inventario'
      };

      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(AuditService.createAudit(mockAuditData))
        .rejects.toThrow('Network error');
    });
  });

  describe('getAudits', () => {
    test('successfully fetches audits without filters', async () => {
      const mockResponse = {
        success: true,
        audits: [
          { auditId: 'AUD-1', name: 'Audit 1' },
          { auditId: 'AUD-2', name: 'Audit 2' }
        ],
        total: 2
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AuditService.getAudits();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/audits');
      expect(result).toEqual(mockResponse);
    });

    test('successfully fetches audits with filters', async () => {
      const filters = {
        status: 'Pendiente',
        priority: 'Alta',
        auditor: 'Test Auditor'
      };

      const mockResponse = {
        success: true,
        audits: [{ auditId: 'AUD-1', name: 'Filtered Audit' }],
        total: 1
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AuditService.getAudits(filters);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/audits?status=Pendiente&priority=Alta&auditor=Test+Auditor'
      );
      expect(result).toEqual(mockResponse);
    });

    test('handles fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Error al obtener auditorías'
        })
      });

      await expect(AuditService.getAudits())
        .rejects.toThrow('Error al obtener auditorías');
    });
  });

  describe('updateAudit', () => {
    test('successfully updates audit', async () => {
      const auditId = 'AUD-123';
      const updateData = {
        name: 'Updated Audit',
        status: 'En Progreso'
      };

      const mockResponse = {
        success: true,
        message: 'Auditoría actualizada exitosamente',
        audit: { auditId, ...updateData }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AuditService.updateAudit(auditId, updateData);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/audits/${auditId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        }
      );

      expect(result).toEqual(mockResponse);
    });

    test('handles update error', async () => {
      const auditId = 'AUD-123';
      const updateData = { name: 'Updated Audit' };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Auditoría no encontrada'
        })
      });

      await expect(AuditService.updateAudit(auditId, updateData))
        .rejects.toThrow('Auditoría no encontrada');
    });
  });

  describe('deleteAudit', () => {
    test('successfully deletes audit', async () => {
      const auditId = 'AUD-123';

      const mockResponse = {
        success: true,
        message: 'Auditoría eliminada exitosamente'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AuditService.deleteAudit(auditId);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/audits/${auditId}`,
        { method: 'DELETE' }
      );

      expect(result).toEqual(mockResponse);
    });

    test('handles delete error', async () => {
      const auditId = 'AUD-123';

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Auditoría no encontrada'
        })
      });

      await expect(AuditService.deleteAudit(auditId))
        .rejects.toThrow('Auditoría no encontrada');
    });
  });

  describe('getAuditStats', () => {
    test('successfully fetches audit statistics', async () => {
      const mockResponse = {
        success: true,
        stats: {
          total: 100,
          active: 25,
          pending: 30,
          completed: 40,
          inReview: 5,
          priorityBreakdown: {
            Alta: 20,
            Media: 50,
            Baja: 30
          }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AuditService.getAuditStats();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/audits/stats/summary');
      expect(result).toEqual(mockResponse);
    });

    test('handles stats fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Error al obtener estadísticas'
        })
      });

      await expect(AuditService.getAuditStats())
        .rejects.toThrow('Error al obtener estadísticas');
    });
  });
});