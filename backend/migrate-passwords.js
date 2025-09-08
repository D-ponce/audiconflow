import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/Users.js";

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/audiconflow", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

// Función para verificar si una contraseña está cifrada
const isPasswordHashed = (password) => {
  // Los hashes de bcrypt siempre empiezan con $2a$, $2b$, $2x$, o $2y$
  return /^\$2[abxy]\$/.test(password);
};

// Migrar contraseñas no cifradas
const migratePasswords = async () => {
  try {
    console.log("🔍 Buscando usuarios con contraseñas no cifradas...");
    
    // Obtener todos los usuarios
    const users = await User.find({});
    console.log(`📊 Total de usuarios encontrados: ${users.length}`);
    
    let migratedCount = 0;
    let alreadyHashedCount = 0;
    
    for (const user of users) {
      if (!isPasswordHashed(user.password)) {
        console.log(`🔧 Migrando contraseña para usuario: ${user.email}`);
        
        // Cifrar la contraseña manualmente
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Actualizar directamente en la base de datos para evitar el middleware
        await User.updateOne(
          { _id: user._id },
          { password: hashedPassword }
        );
        
        migratedCount++;
        console.log(`✅ Contraseña migrada para: ${user.email}`);
      } else {
        alreadyHashedCount++;
        console.log(`✓ Contraseña ya cifrada para: ${user.email}`);
      }
    }
    
    console.log("\n📈 RESUMEN DE MIGRACIÓN:");
    console.log(`✅ Contraseñas migradas: ${migratedCount}`);
    console.log(`✓ Ya estaban cifradas: ${alreadyHashedCount}`);
    console.log(`📊 Total procesados: ${users.length}`);
    
    if (migratedCount > 0) {
      console.log("\n🎉 Migración completada exitosamente!");
      console.log("🔐 Todas las contraseñas ahora están cifradas.");
    } else {
      console.log("\n✨ No se encontraron contraseñas que migrar.");
    }
    
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
  }
};

// Ejecutar migración
const runMigration = async () => {
  console.log("🚀 Iniciando migración de contraseñas...\n");
  
  await connectDB();
  await migratePasswords();
  
  console.log("\n🏁 Proceso de migración finalizado.");
  process.exit(0);
};

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { migratePasswords };
