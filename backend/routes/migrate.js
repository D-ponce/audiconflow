import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/Users.js";

const router = express.Router();

// Función para verificar si una contraseña está cifrada
const isPasswordHashed = (password) => {
  // Los hashes de bcrypt siempre empiezan con $2a$, $2b$, $2x$, o $2y$
  return /^\$2[abxy]\$/.test(password);
};

// Endpoint para migrar contraseñas
router.post("/migrate-passwords", async (req, res) => {
  try {
    console.log("🔍 Iniciando migración de contraseñas...");
    
    // Obtener todos los usuarios
    const users = await User.find({});
    console.log(`📊 Total de usuarios encontrados: ${users.length}`);
    
    let migratedCount = 0;
    let alreadyHashedCount = 0;
    const migrationResults = [];
    
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
        migrationResults.push({
          email: user.email,
          status: "migrated",
          originalPassword: user.password.substring(0, 3) + "***" // Solo mostrar primeros 3 caracteres
        });
        console.log(`✅ Contraseña migrada para: ${user.email}`);
      } else {
        alreadyHashedCount++;
        migrationResults.push({
          email: user.email,
          status: "already_hashed"
        });
        console.log(`✓ Contraseña ya cifrada para: ${user.email}`);
      }
    }
    
    const summary = {
      totalUsers: users.length,
      migratedCount,
      alreadyHashedCount,
      migrationResults
    };
    
    console.log("\n📈 RESUMEN DE MIGRACIÓN:");
    console.log(`✅ Contraseñas migradas: ${migratedCount}`);
    console.log(`✓ Ya estaban cifradas: ${alreadyHashedCount}`);
    console.log(`📊 Total procesados: ${users.length}`);
    
    res.json({
      success: true,
      message: "Migración de contraseñas completada",
      summary
    });
    
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    res.status(500).json({
      success: false,
      message: "Error durante la migración",
      error: error.message
    });
  }
});

// Endpoint para verificar estado de contraseñas
router.get("/check-passwords", async (req, res) => {
  try {
    const users = await User.find({}, { email: 1, password: 1 });
    
    const results = users.map(user => ({
      email: user.email,
      isHashed: isPasswordHashed(user.password),
      passwordPreview: user.password.substring(0, 10) + "..."
    }));
    
    const summary = {
      totalUsers: users.length,
      hashedPasswords: results.filter(r => r.isHashed).length,
      plainPasswords: results.filter(r => !r.isHashed).length
    };
    
    res.json({
      success: true,
      summary,
      details: results
    });
    
  } catch (error) {
    console.error("❌ Error verificando contraseñas:", error);
    res.status(500).json({
      success: false,
      message: "Error verificando contraseñas",
      error: error.message
    });
  }
});

export default router;
