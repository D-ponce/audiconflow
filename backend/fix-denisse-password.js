import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/Users.js";

const fixDenissePassword = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/audiconflow");
    console.log("✅ Conectado a MongoDB");

    // Buscar el usuario Denisse
    const user = await User.findOne({ email: "denisse.ponce@empresas.com" });
    
    if (!user) {
      console.log("❌ Usuario Denisse no encontrado");
      return;
    }

    console.log("👤 Usuario encontrado:", user.email);
    console.log("🔐 Password actual:", user.password);

    // La contraseña actual parece ser "denisse12" sin hash
    const currentPassword = user.password;
    
    // Verificar si ya está hasheada
    const isHashed = currentPassword.startsWith('$2b$') || currentPassword.startsWith('$2a$');
    
    if (isHashed) {
      console.log("✅ La contraseña ya está hasheada");
      
      // Probar login con contraseñas comunes
      const testPasswords = ["denisse12", "123456", "admin123"];
      
      for (const testPwd of testPasswords) {
        const match = await bcrypt.compare(testPwd, currentPassword);
        console.log(`🔍 Test "${testPwd}": ${match ? "✅ MATCH" : "❌ NO MATCH"}`);
      }
    } else {
      console.log("⚠️ La contraseña NO está hasheada, aplicando hash...");
      
      // Hashear la contraseña actual
      const hashedPassword = await bcrypt.hash(currentPassword, 10);
      
      // Actualizar en la base de datos
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      
      console.log("✅ Contraseña hasheada y actualizada");
      console.log("🔐 Nuevo hash:", hashedPassword);
      
      // Verificar que funciona
      const match = await bcrypt.compare(currentPassword, hashedPassword);
      console.log(`🔍 Verificación: ${match ? "✅ ÉXITO" : "❌ FALLO"}`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
  }
};

fixDenissePassword();
