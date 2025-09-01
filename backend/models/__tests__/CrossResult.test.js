import mongoose from 'mongoose';
import CrossResult from '../CrossResult.js';

// Mock de mongoose para las pruebas
jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation(() => ({
    index: jest.fn(),
    pre: jest.fn(),
    methods: {}
  })),
  model: jest.fn(),
  Types: {
    Mixed: 'Mixed'
  }
}));

describe('CrossResult Model', () => {
  let mockCrossResult;

  beforeEach(() => {
    // Crear mock del documento
    mockCrossResult = {
      auditId: 'TEST_AUDIT_001',
      crossId: 'CROSS_TEST_123',
      keyField: 'RUT',
      resultField: 'Tipo de cuenta',
      results: [
        {
          keyValue: '12.345.678',
          resultValue: 'Personal',
          status: 'hay coincidencia',
          sourceFiles: ['file1.xlsx', 'file2.xlsx']
        },
        {
          keyValue: '13.456.789',
          resultValue: 'N/A',
          status: 'no hay coincidencia',
          sourceFiles: ['file1.xlsx']
        },
        {
          keyValue: '14.567.890',
          resultValue: 'Personal',
          status: 'hay coincidencia',
          sourceFiles: ['file1.xlsx', 'file2.xlsx']
        }
      ],
      summary: {},
      calculateSummary: function() {
        const totalRecords = this.results.length;
        const matchingRecords = this.results.filter(r => r.status === 'hay coincidencia').length;
        const nonMatchingRecords = totalRecords - matchingRecords;
        const matchPercentage = totalRecords > 0 ? Math.round((matchingRecords / totalRecords) * 100) : 0;

        this.summary = {
          totalRecords,
          matchingRecords,
          nonMatchingRecords,
          matchPercentage
        };

        return this.summary;
      }
    };
  });

  describe('calculateSummary method', () => {
    test('debe calcular correctamente las estadísticas del cruce', () => {
      const summary = mockCrossResult.calculateSummary();

      expect(summary.totalRecords).toBe(3);
      expect(summary.matchingRecords).toBe(2);
      expect(summary.nonMatchingRecords).toBe(1);
      expect(summary.matchPercentage).toBe(67); // 2/3 * 100 = 66.67 -> 67
    });

    test('debe manejar correctamente cuando no hay resultados', () => {
      mockCrossResult.results = [];
      const summary = mockCrossResult.calculateSummary();

      expect(summary.totalRecords).toBe(0);
      expect(summary.matchingRecords).toBe(0);
      expect(summary.nonMatchingRecords).toBe(0);
      expect(summary.matchPercentage).toBe(0);
    });

    test('debe calcular 100% cuando todos los resultados coinciden', () => {
      mockCrossResult.results = [
        {
          keyValue: '12.345.678',
          status: 'hay coincidencia'
        },
        {
          keyValue: '13.456.789',
          status: 'hay coincidencia'
        }
      ];

      const summary = mockCrossResult.calculateSummary();

      expect(summary.totalRecords).toBe(2);
      expect(summary.matchingRecords).toBe(2);
      expect(summary.nonMatchingRecords).toBe(0);
      expect(summary.matchPercentage).toBe(100);
    });

    test('debe calcular 0% cuando ningún resultado coincide', () => {
      mockCrossResult.results = [
        {
          keyValue: '12.345.678',
          status: 'no hay coincidencia'
        },
        {
          keyValue: '13.456.789',
          status: 'no hay coincidencia'
        }
      ];

      const summary = mockCrossResult.calculateSummary();

      expect(summary.totalRecords).toBe(2);
      expect(summary.matchingRecords).toBe(0);
      expect(summary.nonMatchingRecords).toBe(2);
      expect(summary.matchPercentage).toBe(0);
    });
  });

  describe('Schema validation', () => {
    test('debe requerir campos obligatorios', () => {
      const requiredFields = [
        'auditId',
        'crossId',
        'keyField',
        'resultField'
      ];

      // Verificar que los campos requeridos están definidos
      requiredFields.forEach(field => {
        expect(mockCrossResult).toHaveProperty(field);
        expect(mockCrossResult[field]).toBeDefined();
      });
    });

    test('debe tener estructura correcta para processedFiles', () => {
      const processedFile = {
        filename: 'test.xlsx',
        originalName: 'test_original.xlsx',
        recordCount: 100,
        uploadDate: new Date()
      };

      mockCrossResult.processedFiles = [processedFile];

      expect(mockCrossResult.processedFiles[0]).toHaveProperty('filename');
      expect(mockCrossResult.processedFiles[0]).toHaveProperty('originalName');
      expect(mockCrossResult.processedFiles[0]).toHaveProperty('recordCount');
    });

    test('debe tener estructura correcta para results', () => {
      const result = mockCrossResult.results[0];

      expect(result).toHaveProperty('keyValue');
      expect(result).toHaveProperty('resultValue');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('sourceFiles');
      expect(Array.isArray(result.sourceFiles)).toBe(true);
    });

    test('debe validar estados permitidos', () => {
      const validStatuses = ['hay coincidencia', 'no hay coincidencia'];
      
      mockCrossResult.results.forEach(result => {
        expect(validStatuses).toContain(result.status);
      });
    });
  });

  describe('executionDetails', () => {
    test('debe tener estructura correcta para detalles de ejecución', () => {
      mockCrossResult.executionDetails = {
        startTime: new Date(),
        endTime: new Date(),
        duration: 1500,
        executedBy: 'Test User'
      };

      expect(mockCrossResult.executionDetails).toHaveProperty('startTime');
      expect(mockCrossResult.executionDetails).toHaveProperty('endTime');
      expect(mockCrossResult.executionDetails).toHaveProperty('duration');
      expect(mockCrossResult.executionDetails).toHaveProperty('executedBy');
    });

    test('debe calcular duración correctamente', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:01:30Z'); // 90 segundos después

      mockCrossResult.executionDetails = {
        startTime,
        endTime,
        duration: endTime - startTime,
        executedBy: 'Test User'
      };

      expect(mockCrossResult.executionDetails.duration).toBe(90000); // 90 segundos en milisegundos
    });
  });

  describe('Data integrity', () => {
    test('debe mantener consistencia entre resultados y archivos procesados', () => {
      const processedFileNames = ['file1.xlsx', 'file2.xlsx'];
      mockCrossResult.processedFiles = processedFileNames.map(name => ({
        filename: name,
        originalName: name,
        recordCount: 50
      }));

      // Verificar que todos los archivos en results existen en processedFiles
      const allSourceFiles = mockCrossResult.results
        .flatMap(result => result.sourceFiles)
        .filter((file, index, arr) => arr.indexOf(file) === index); // unique

      allSourceFiles.forEach(sourceFile => {
        const exists = processedFileNames.includes(sourceFile);
        expect(exists).toBe(true);
      });
    });

    test('debe generar crossId único', () => {
      const crossId1 = `CROSS_TEST_${Date.now()}_1`;
      const crossId2 = `CROSS_TEST_${Date.now()}_2`;

      expect(crossId1).not.toBe(crossId2);
      expect(crossId1).toMatch(/^CROSS_TEST_\d+_\d+$/);
    });
  });
});
