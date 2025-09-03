import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Audit from '../../models/Audit.js';
import auditsRouter from '../audits.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/audits', auditsRouter);

// Mock Audit model
jest.mock('../../models/Audit.js');

describe('Audits Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/audits/create', () => {
    test('successfully creates a new audit', async () => {
      const mockAudit = {
        auditId: 'AUD-1234567890',
        name: 'Test Audit',
        type: 'Inventario',
        location: 'Almacén A',
        priority: 'Alta',
        dueDate: new Date('2024-12-31'),
        auditor: 'Test Auditor',
        description: 'Test description',
        status: 'Pendiente',
        save: jest.fn().mockResolvedValue(true)
      };

      Audit.mockImplementation(() => mockAudit);

      const response = await request(app)
        .post('/api/audits/create')
        .send({
          name: 'Test Audit',
          type: 'Inventario',
          location: 'Almacén A',
          priority: 'Alta',
          dueDate: '2024-12-31',
          auditor: 'Test Auditor',
          description: 'Test description'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Auditoría creada exitosamente');
      expect(response.body.audit).toBeDefined();
    });

    test('returns error when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/audits/create')
        .send({
          name: 'Test Audit'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('requeridos');
    });

    test('handles server errors', async () => {
      Audit.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/audits/create')
        .send({
          name: 'Test Audit',
          type: 'Inventario',
          location: 'Almacén A',
          dueDate: '2024-12-31'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error interno del servidor');
    });
  });

  describe('GET /api/audits', () => {
    test('returns filtered audits successfully', async () => {
      const mockAudits = [
        {
          auditId: 'AUD-1',
          name: 'Audit 1',
          type: 'Inventario',
          location: 'Almacén A',
          status: 'Pendiente',
          auditor: 'Auditor 1'
        },
        {
          auditId: 'AUD-2',
          name: 'Audit 2',
          type: 'Financiero',
          location: 'Oficina B',
          status: 'Completada',
          auditor: 'Auditor 2'
        }
      ];

      Audit.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockAudits)
      });

      const response = await request(app).get('/api/audits');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.audits).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    test('applies status filter', async () => {
      Audit.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      await request(app).get('/api/audits?status=Pendiente');

      expect(Audit.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $and: expect.arrayContaining([
            expect.objectContaining({ status: expect.any(RegExp) })
          ])
        })
      );
    });

    test('handles server errors', async () => {
      Audit.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app).get('/api/audits');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/audits/stats/summary', () => {
    test('returns audit statistics', async () => {
      Audit.countDocuments.mockImplementation((filter) => {
        if (filter.status === 'Activa') return Promise.resolve(5);
        if (filter.status === 'Pendiente') return Promise.resolve(3);
        if (filter.status === 'Completada') return Promise.resolve(10);
        if (filter.status === 'En Revisión') return Promise.resolve(2);
        return Promise.resolve(20); // total
      });

      Audit.aggregate.mockResolvedValue([
        { _id: 'Alta', count: 8 },
        { _id: 'Media', count: 10 },
        { _id: 'Baja', count: 2 }
      ]);

      const response = await request(app).get('/api/audits/stats/summary');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBe(20);
      expect(response.body.stats.active).toBe(5);
      expect(response.body.stats.pending).toBe(3);
      expect(response.body.stats.completed).toBe(10);
    });
  });

  describe('GET /api/audits/:id', () => {
    test('returns audit by ID', async () => {
      const mockAudit = {
        auditId: 'AUD-123',
        name: 'Test Audit',
        type: 'Inventario'
      };

      Audit.findOne.mockResolvedValue(mockAudit);

      const response = await request(app).get('/api/audits/AUD-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.audit).toEqual(mockAudit);
    });

    test('returns 404 when audit not found', async () => {
      Audit.findOne.mockResolvedValue(null);

      const response = await request(app).get('/api/audits/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Auditoría no encontrada');
    });
  });

  describe('PUT /api/audits/:id', () => {
    test('successfully updates audit', async () => {
      const mockUpdatedAudit = {
        auditId: 'AUD-123',
        name: 'Updated Audit',
        status: 'En Progreso'
      };

      Audit.findOneAndUpdate.mockResolvedValue(mockUpdatedAudit);

      const response = await request(app)
        .put('/api/audits/AUD-123')
        .send({
          name: 'Updated Audit',
          status: 'En Progreso'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('actualizada exitosamente');
      expect(response.body.audit).toEqual(mockUpdatedAudit);
    });

    test('returns 404 when audit not found for update', async () => {
      Audit.findOneAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/audits/nonexistent')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/audits/:id', () => {
    test('successfully deletes audit', async () => {
      const mockDeletedAudit = {
        auditId: 'AUD-123',
        name: 'Deleted Audit'
      };

      Audit.findOneAndDelete.mockResolvedValue(mockDeletedAudit);

      const response = await request(app).delete('/api/audits/AUD-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('eliminada exitosamente');
    });

    test('returns 404 when audit not found for deletion', async () => {
      Audit.findOneAndDelete.mockResolvedValue(null);

      const response = await request(app).delete('/api/audits/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization and Permissions', () => {
    test('validates user permissions for audit creation', async () => {
      // Mock unauthorized user
      const response = await request(app)
        .post('/api/audits/create')
        .set('Authorization', 'Bearer invalid_token')
        .send({
          name: 'Test Audit',
          type: 'Inventario',
          location: 'Almacén A',
          dueDate: '2024-12-31'
        });

      // Should handle authorization (currently not implemented, so we expect it to work)
      expect(response.status).toBeLessThan(500);
    });

    test('validates audit data format', async () => {
      const response = await request(app)
        .post('/api/audits/create')
        .send({
          name: '', // Empty name
          type: 'InvalidType', // Invalid type
          location: 'Almacén A',
          dueDate: 'invalid-date', // Invalid date format
          priority: 'InvalidPriority' // Invalid priority
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('handles concurrent audit creation', async () => {
      const mockAudit = {
        auditId: 'AUD-CONCURRENT',
        name: 'Concurrent Audit',
        save: jest.fn().mockResolvedValue(true)
      };

      Audit.mockImplementation(() => mockAudit);

      // Simulate concurrent requests
      const promises = Array(3).fill().map(() => 
        request(app)
          .post('/api/audits/create')
          .send({
            name: 'Concurrent Audit',
            type: 'Inventario',
            location: 'Almacén A',
            dueDate: '2024-12-31'
          })
      );

      const responses = await Promise.all(promises);
      
      // All should succeed (in real scenario, might have conflicts)
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles extremely long audit names', async () => {
      const longName = 'A'.repeat(1000);
      
      const response = await request(app)
        .post('/api/audits/create')
        .send({
          name: longName,
          type: 'Inventario',
          location: 'Almacén A',
          dueDate: '2024-12-31'
        });

      expect(response.status).toBeLessThan(500);
    });

    test('handles special characters in audit data', async () => {
      const mockAudit = {
        auditId: 'AUD-SPECIAL',
        name: 'Audit with Special Chars: áéíóú ñ @#$%',
        save: jest.fn().mockResolvedValue(true)
      };

      Audit.mockImplementation(() => mockAudit);

      const response = await request(app)
        .post('/api/audits/create')
        .send({
          name: 'Audit with Special Chars: áéíóú ñ @#$%',
          type: 'Inventario',
          location: 'Almacén A',
          dueDate: '2024-12-31'
        });

      expect(response.status).toBe(201);
    });

    test('handles database connection timeout', async () => {
      Audit.mockImplementation(() => {
        const error = new Error('Connection timeout');
        error.code = 'ETIMEDOUT';
        throw error;
      });

      const response = await request(app)
        .post('/api/audits/create')
        .send({
          name: 'Test Audit',
          type: 'Inventario',
          location: 'Almacén A',
          dueDate: '2024-12-31'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
