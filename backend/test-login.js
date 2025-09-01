import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/Users.js";

const testLogin = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/audiconflow");
    console.log("✅ Conectado a MongoDB");

    // Buscar todos los usuarios
    const users = await User.find({});
    console.log("📋 Usuarios en BD:", users.length);
    
    users.forEach((user, index) => {
      console.log(`\n👤 Usuario ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password Hash: ${user.password}`);
      console.log(`  Status: ${user.status}`);
    });

    // Probar login con el usuario específico
    const testEmail = "denisse.ponce@empresas.com";
    const testPassword = "123456"; // La contraseña que intentas usar

    console.log(`\n🔍 Probando login con:`);
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}`);

    const dbUser = await User.findOne({ email: testEmail });
    
    if (dbUser) {
      console.log("✅ Usuario encontrado");
      console.log(`  Hash en BD: ${dbUser.password}`);
      
      const isMatch = await bcrypt.compare(testPassword, dbUser.password);
      console.log(`  Password match: ${isMatch}`);
      
      if (!isMatch) {
        console.log("❌ La contraseña no coincide");
        
        // Probar hasheando la contraseña manualmente
        const manualHash = await bcrypt.hash(testPassword, 10);
        console.log(`  Hash manual: ${manualHash}`);
        
        const manualMatch = await bcrypt.compare(testPassword, manualHash);
        console.log(`  Manual match: ${manualMatch}`);
      }
    } else {
      console.log("❌ Usuario no encontrado");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
  }
};

testLogin();
