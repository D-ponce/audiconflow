import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/Users.js";

const createTestUser = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/audiconflow");
    console.log("✅ Conectado a MongoDB");

    // Eliminar usuario existente si existe
    await User.deleteOne({ email: "denisse.ponce@empresas.com" });
    console.log("🗑️ Usuario anterior eliminado");

    // Crear hash de contraseña manualmente
    const password = "123456";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log(`🔐 Password original: ${password}`);
    console.log(`🔐 Password hasheado: ${hashedPassword}`);

    // Crear usuario directamente
    const newUser = new User({
      name: "Denisse Ponce",
      email: "denisse.ponce@empresas.com",
      password: hashedPassword, // Usar hash pre-generado
      role: "administrador",
      department: "Administración",
      phone: "+34 600 000 000",
      status: "Activo",
      permissions: ["users_manage", "alerts_review"]
    });

    // Deshabilitar el middleware pre-save temporalmente
    newUser.$__skipPreSave = true;
    
    await newUser.save();
    console.log("✅ Usuario creado exitosamente");

    // Verificar que se guardó correctamente
    const savedUser = await User.findOne({ email: "denisse.ponce@empresas.com" });
    console.log("📋 Usuario guardado:", {
      email: savedUser.email,
      role: savedUser.role,
      passwordHash: savedUser.password
    });

    // Probar login
    const isMatch = await bcrypt.compare(password, savedUser.password);
    console.log(`🔍 Test login: ${isMatch ? "✅ ÉXITO" : "❌ FALLO"}`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
  }
};

createTestUser();
