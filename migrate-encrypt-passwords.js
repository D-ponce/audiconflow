import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: './backend/.env' });

// Esquema temporal para acceder a los usuarios
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  phone: String,
  status: String,
  permissions: [String],
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date
}, { collection: 'users' });

const User = mongoose.model('TempUser', userSchema);

async function migratePasswords() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/audiconflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');
    
    // Buscar usuarios con contraseñas no cifradas
    console.log('🔍 Buscando usuarios con contraseñas no cifradas...');
    
    const users = await User.find({});
    console.log(`📊 Total de usuarios encontrados: ${users.length}`);
    
    let encryptedCount = 0;
    let alreadyEncryptedCount = 0;
    
    for (const user of users) {
      // Verificar si la contraseña ya está cifrada (bcrypt hashes empiezan con $2b$)
      if (user.password && !user.password.startsWith('$2b$')) {
        console.log(`🔐 Cifrando contraseña para usuario: ${user.email}`);
        
        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Actualizar directamente en la base de datos sin triggear middleware
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
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
    process.exit(1);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar migración
console.log('🚀 Iniciando migración de cifrado de contraseñas...');
console.log('⚠️  IMPORTANTE: Este script cifrará todas las contraseñas en texto plano');
console.log('📝 Las contraseñas ya cifradas (que empiecen con $2b$) no serán modificadas\n');

migratePasswords();
