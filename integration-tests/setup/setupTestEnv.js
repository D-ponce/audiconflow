import { spawn } from 'child_process';
import { MongoClient } from 'mongodb';
import axios from 'axios';

const BACKEND_PORT = 5001; // Puerto diferente para pruebas
const MONGO_URL = 'mongodb://localhost:27017/audiconflow_integration_test';

class TestEnvironment {
  constructor() {
    this.backendProcess = null;
    this.mongoClient = null;
  }

  async startBackend() {
    console.log('🚀 Iniciando servidor backend para pruebas...');
    
    return new Promise((resolve, reject) => {
      // Configurar variables de entorno para pruebas
      const env = {
        ...process.env,
        NODE_ENV: 'test',
        PORT: BACKEND_PORT,
        MONGODB_URI: MONGO_URL
      };

      this.backendProcess = spawn('node', ['server.js'], {
        cwd: '../backend',
        env,
        stdio: 'pipe'
      });

      this.backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Backend: ${output}`);
        
        if (output.includes('Servidor corriendo') || output.includes('Server running')) {
          resolve();
        }
      });

      this.backendProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
      });

      this.backendProcess.on('error', (error) => {
        reject(error);
      });

      // Timeout después de 30 segundos
      setTimeout(() => {
        reject(new Error('Timeout iniciando backend'));
      }, 30000);
    });
  }

  async setupDatabase() {
    console.log('🗄️ Configurando base de datos de prueba...');
    
    this.mongoClient = new MongoClient(MONGO_URL);
    await this.mongoClient.connect();
    
    const db = this.mongoClient.db();
    
    // Crear índices necesarios
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('audits').createIndex({ auditId: 1 }, { unique: true });
    
    console.log('✅ Base de datos configurada');
  }

  async waitForServices() {
    console.log('⏳ Esperando servicios...');
    
    // Esperar backend
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await axios.get(`http://localhost:${BACKEND_PORT}/health`);
        console.log('✅ Backend listo');
        break;
      } catch (error) {
        if (i === maxAttempts - 1) {
          throw new Error('Backend no respondió');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async start() {
    try {
      await this.setupDatabase();
      await this.startBackend();
      await this.waitForServices();
      
      console.log('🎉 Entorno de pruebas listo');
      return true;
    } catch (error) {
      console.error('❌ Error configurando entorno:', error);
      await this.cleanup();
      throw error;
    }
  }

  async cleanup() {
    console.log('🧹 Limpiando entorno de pruebas...');
    
    if (this.backendProcess) {
      this.backendProcess.kill();
    }
    
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }
}

// Exportar para uso en pruebas
export default TestEnvironment;

// Si se ejecuta directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const env = new TestEnvironment();
  
  process.on('SIGINT', async () => {
    await env.cleanup();
    process.exit(0);
  });
  
  env.start().catch(console.error);
}
