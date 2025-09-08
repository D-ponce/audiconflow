import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/Users.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function encryptExistingPasswords() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/audiconflow');
    console.log('✅ Conectado a MongoDB');
    
    // Buscar usuarios con contraseñas no cifradas
    console.log('🔍 Buscando usuarios con contraseñas no cifradas...');
    
    const users = await User.find({});
    console.log(`📊 Total de usuarios encontrados: ${users.length}`);
    
    let encryptedCount = 0;
    let alreadyEncryptedCount = 0;
    
    for (const user of users) {
      // Verificar si la contraseña ya está cifrada
      if (user.password && !user.password.startsWith('$2b$')) {
        console.log(`🔐 Cifrando contraseña para usuario: ${user.email}`);
        
        // Actualizar la contraseña directamente para triggear el middleware
        user.password = user.password; // Esto marcará el campo como modificado
        await user.save(); // El middleware pre-save se encargará del cifrado
        
        encryptedCount++;
        console.log(`✅ Contraseña cifrada para: ${user.email}`);
      } else if (user.password && user.password.startsWith('$2b$')) {
        alreadyEncryptedCount++;
        console.log(`ℹ️  Contraseña ya cifrada para: ${user.email}`);
      }
    }
    
    console.log('\n📋 RESUMEN DE MIGRACIÓN:');
    console.log(`✅ Contraseñas cifradas: ${encryptedCount}`);
    console.log(`ℹ️  Ya estaban cifradas: ${alreadyEncryptedCount}`);
    console.log(`📊 Total procesados: ${users.length}`);
    
    if (encryptedCount > 0) {
      console.log('\n🎉 Migración completada exitosamente!');
      console.log('🔒 Todas las contraseñas ahora están cifradas con bcrypt (salt rounds: 12)');
    } else {
      console.log('\n✨ No se encontraron contraseñas sin cifrar');
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

console.log('🚀 Iniciando cifrado de contraseñas existentes...');
console.log('⚠️  Este script cifrará todas las contraseñas en texto plano\n');

encryptExistingPasswords();
