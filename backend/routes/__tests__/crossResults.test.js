import request from 'supertest';
import express from 'express';
import crossResultsRoutes from '../crossResults.js';
import CrossResult from '../../models/CrossResult.js';
import Audit from '../../models/Audit.js';

// Mock de los modelos
jest.mock('../../models/CrossResult.js');
jest.mock('../../models/Audit.js');

const app = express();
app.use(express.json());
app.use('/api/cross-results', crossResultsRoutes);

describe('Cross Results Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/cross-results', () => {
    const validCrossData = {
      auditId: 'TEST_AUDIT_001',
      keyField: 'RUT',
      resultField: 'Tipo de cuenta',
      processedFiles: [
        {
          filename: 'test.xlsx',
          originalName: 'test.xlsx',
          recordCount: 10
        }
      ],
      results: [
        {
          keyValue: '12.345.678',
          resultValue: 'Personal',
          status: 'hay coincidencia',
          sourceFiles: ['test.xlsx']
        }
      ],
      executedBy: 'Test User'
    };

    test('debe crear resultado de cruce exitosamente', async () => {
      // Mock de auditoría existente
      Audit.findOne.mockResolvedValue({
        auditId: 'TEST_AUDIT_001',
        name: 'Test Audit'
      });

      // Mock de guardado exitoso
      const mockSave = jest.fn().mockResolvedValue({
        crossId: 'CROSS_TEST_123',
        summary: {
          totalRecords: 1,
          matchingRecords: 1,
          nonMatchingRecords: 0,
          matchPercentage: 100
        },
        executionDetails: {
          executedBy: 'Test User',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000
        }
      });

      CrossResult.mockImplementation(() => ({
        save: mockSave,
        crossId: 'CROSS_TEST_123',
        summary: {
          totalRecords: 1,
          matchingRecords: 1,
          nonMatchingRecords: 0,
          matchPercentage: 100
        },
        executionDetails: {
          executedBy: 'Test User',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000
        }
      }));

      const response = await request(app)
        .post('/api/cross-results')
        .send(validCrossData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('guardado exitosamente');
      expect(response.body.data.crossId).toBe('CROSS_TEST_123');
    });

    test('debe retornar error 404 cuando auditoría no existe', async () => {
      Audit.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/cross-results')
        .send(validCrossData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Auditoría no encontrada');
    });

    test('debe manejar errores del servidor', async () => {
      Audit.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/cross-results')
        .send(validCrossData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error interno del servidor');
    });
  });

  describe('GET /api/cross-results/:auditId', () => {
    test('debe obtener resultados de cruce por auditoría', async () => {
      const mockResults = [
        {
          crossId: 'CROSS_1',
          auditId: 'TEST_AUDIT_001',
          keyField: 'RUT',
          resultField: 'Tipo de cuenta',
          summary: {
            totalRecords: 10,
            matchingRecords: 8,
            matchPercentage: 80
          },
          createdAt: new Date()
        }
      ];

      CrossResult.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue(mockResults)
            })
          })
        })
      });

      CrossResult.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/cross-results/TEST_AUDIT_001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResults);
      expect(response.body.pagination.total).toBe(1);
    });

    test('debe manejar paginación correctamente', async () => {
      CrossResult.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      CrossResult.countDocuments.mockResolvedValue(25);

      const response = await request(app)
        .get('/api/cross-results/TEST_AUDIT_001?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBe(25);
      expect(response.body.pagination.pages).toBe(3);
    });
  });

  describe('GET /api/cross-results/detail/:crossId', () => {
    test('debe obtener detalle de resultado específico', async () => {
      const mockResult = {
        crossId: 'CROSS_TEST_123',
        auditId: 'TEST_AUDIT_001',
        results: [
          {
            keyValue: '12.345.678',
            resultValue: 'Personal',
            status: 'hay coincidencia'
          }
        ]
      };

      CrossResult.findOne.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/cross-results/detail/CROSS_TEST_123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
    });

    test('debe retornar 404 cuando resultado no existe', async () => {
      CrossResult.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/cross-results/detail/NONEXISTENT');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Resultado de cruce no encontrado');
    });
  });

  describe('PUT /api/cross-results/:crossId', () => {
    test('debe actualizar resultado exitosamente', async () => {
      const mockUpdatedResult = {
        crossId: 'CROSS_TEST_123',
        status: 'Completado',
        updatedAt: new Date()
      };

      CrossResult.findOneAndUpdate.mockResolvedValue(mockUpdatedResult);

      const response = await request(app)
        .put('/api/cross-results/CROSS_TEST_123')
        .send({ status: 'Completado' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('actualizado exitosamente');
      expect(response.body.data).toEqual(mockUpdatedResult);
    });

    test('debe retornar 404 cuando resultado no existe', async () => {
      CrossResult.findOneAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/cross-results/NONEXISTENT')
        .send({ status: 'Completado' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cross-results/:crossId', () => {
    test('debe eliminar resultado exitosamente', async () => {
      CrossResult.findOneAndDelete.mockResolvedValue({
        crossId: 'CROSS_TEST_123'
      });

      const response = await request(app)
        .delete('/api/cross-results/CROSS_TEST_123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('eliminado exitosamente');
    });

    test('debe retornar 404 cuando resultado no existe', async () => {
      CrossResult.findOneAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/cross-results/NONEXISTENT');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cross-results/stats/:auditId', () => {
    test('debe obtener estadísticas de cruces por auditoría', async () => {
      const mockStats = [
        {
          _id: null,
          totalCrosses: 5,
          totalRecords: 100,
          totalMatches: 85,
          avgMatchPercentage: 85,
          lastExecution: new Date()
        }
      ];

      CrossResult.aggregate.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/cross-results/stats/TEST_AUDIT_001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats[0]);
    });

    test('debe retornar estadísticas vacías cuando no hay datos', async () => {
      CrossResult.aggregate.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/cross-results/stats/TEST_AUDIT_001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCrosses).toBe(0);
      expect(response.body.data.totalRecords).toBe(0);
    });
  });
});
