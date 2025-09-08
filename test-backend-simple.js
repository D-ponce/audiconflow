// Test simple del backend
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/audiconflow';

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba para cross-results
app.get('/api/cross-results/test', async (req, res) => {
  try {
    console.log('🧪 Ruta de prueba cross-results llamada');
    
    // Verificar conexión a MongoDB
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    }[dbState] || 'unknown';
    
    res.json({
      success: true,
      message: 'Endpoint cross-results funcionando',
      database: {
        status: dbStatus,
        uri: MONGODB_URI.replace(/\/\/.*@/, '//***:***@') // Ocultar credenciales
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en ruta de prueba:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Conectar a MongoDB
async function connectDB() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    console.log('⚠️ Continuando sin MongoDB...');
  }
}

// Iniciar servidor
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
    console.log(`🔍 Cross-results test: http://localhost:${PORT}/api/cross-results/test`);
  });
}

startServer().catch(console.error);
