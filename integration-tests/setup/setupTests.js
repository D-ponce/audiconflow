import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Configuración global para pruebas de integración
global.testConfig = {
  backendUrl: 'http://localhost:5000',
  frontendUrl: 'http://localhost:3000',
  mongoUrl: 'mongodb://localhost:27017/audiconflow_integration_test',
  testTimeout: 30000
};

// Cliente MongoDB para limpieza de datos
let mongoClient;

beforeAll(async () => {
  // Conectar a la base de datos de prueba
  mongoClient = new MongoClient(global.testConfig.mongoUrl);
  await mongoClient.connect();
  global.testDb = mongoClient.db();
});

afterAll(async () => {
  // Cerrar conexión a la base de datos
  if (mongoClient) {
    await mongoClient.close();
  }
});

beforeEach(async () => {
  // Limpiar datos antes de cada prueba
  if (global.testDb) {
    await global.testDb.collection('users').deleteMany({});
    await global.testDb.collection('audits').deleteMany({});
    await global.testDb.collection('fs.files').deleteMany({});
    await global.testDb.collection('fs.chunks').deleteMany({});
  }
});

// Utilidades para pruebas de integración
global.testUtils = {
  // Crear usuario de prueba
  createTestUser: async (userData = {}) => {
    const defaultUser = {
      email: 'test@example.com',
      password: 'password123',
      role: 'auditor'
    };
    return { ...defaultUser, ...userData };
  },

  // Crear auditoría de prueba
  createTestAudit: async (auditData = {}) => {
    const defaultAudit = {
      name: 'Auditoría de Prueba',
      type: 'Inventario',
      location: 'Almacén A',
      priority: 'Alta',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      auditor: 'Test Auditor',
      description: 'Descripción de prueba'
    };
    return { ...defaultAudit, ...auditData };
  },

  // Esperar que el servidor esté listo
  waitForServer: async (url, maxAttempts = 10) => {
    const axios = (await import('axios')).default;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await axios.get(`${url}/health`);
        return true;
      } catch (error) {
        if (i === maxAttempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
};
