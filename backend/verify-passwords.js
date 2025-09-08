import mongoose from 'mongoose';
import User from './models/Users.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/audiconflow');
    console.log('✅ Conectado a MongoDB');
    
    const users = await User.find({}, 'email password');
    console.log(`\n📊 Verificando ${users.length} usuarios:\n`);
    
    let encryptedCount = 0;
    let plainTextCount = 0;
    
    users.forEach(user => {
      if (user.password && user.password.startsWith('$2b$')) {
        console.log(`✅ ${user.email}: Contraseña CIFRADA`);
        encryptedCount++;
      } else {
        console.log(`❌ ${user.email}: Contraseña EN TEXTO PLANO`);
        plainTextCount++;
      }
    });
    
    console.log(`\n📋 RESUMEN:`);
    console.log(`✅ Contraseñas cifradas: ${encryptedCount}`);
    console.log(`❌ Contraseñas en texto plano: ${plainTextCount}`);
    
    if (plainTextCount === 0) {
      console.log('\n🎉 ¡Todas las contraseñas están cifradas correctamente!');
    } else {
      console.log('\n⚠️  Hay contraseñas que necesitan ser cifradas');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

verifyPasswords();
