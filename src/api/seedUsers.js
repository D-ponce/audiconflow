import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// 🔗 Conexión a MongoDB
mongoose.connect("mongodb://localhost:27017/audiconflow", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 📂 Esquema: colección admin.users
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
  },
  { collection: "users" } // 👈 fuerza a usar "admin.users"
);

const User = mongoose.model("User", userSchema, "users");

const seedUsers = async () => {
  try {
    // Eliminar usuarios previos para evitar duplicados
    await User.deleteMany({});

    // Generar contraseñas cifradas
    const saltRounds = 10;
    const auditorPass = await bcrypt.hash("auditor123", saltRounds);
    const supervisorPass = await bcrypt.hash("supervisor123", saltRounds);
    const adminPass = await bcrypt.hash("admin123", saltRounds);

    // Insertar usuarios
    await User.insertMany([
      {
        email: "auditor@audiconflow.com",
        password: auditorPass,
        role: "auditor",
      },
      {
        email: "supervisor@audiconflow.com",
        password: supervisorPass,
        role: "supervisor",
      },
      {
        email: "admin@audiconflow.com",
        password: adminPass,
        role: "administrador",
      },
    ]);

    console.log("✅ Usuarios insertados con contraseñas cifradas en admin.users - seedUsers.js:52");
    process.exit();
  } catch (err) {
    console.error("❌ Error insertando usuarios: - seedUsers.js:55", err);
    process.exit(1);
  }
};

seedUsers();
