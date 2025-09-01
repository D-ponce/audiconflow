import mongoose from "mongoose";
import User from "../models/Users.js";
import dotenv from "dotenv";

dotenv.config();

const createAdminUser = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/audiconflow", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Conectado a MongoDB");

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: "admin" });
    
    if (existingAdmin) {
      console.log("✅ Ya existe un usuario admin:", existingAdmin.email);
      return;
    }

    // Crear usuario admin
    const adminUser = new User({
      name: "Administrador",
      email: "admin@audiconflow.com",
      password: "admin123", // Se hasheará automáticamente
      role: "admin",
      department: "Administración",
      phone: "+34 600 000 000",
      status: "Activo",
      permissions: ["users_manage", "alerts_review"]
    });

    await adminUser.save();
    
    console.log("🚀 Usuario admin creado exitosamente:");
    console.log("📧 Email: admin@audiconflow.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Rol: admin");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
  }
};

createAdminUser();
