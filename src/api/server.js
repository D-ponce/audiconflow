import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";

// ...

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/audiconflow", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Modelo de usuario
const userSchema = new mongoose.Schema({
  email: String,
  password: String, // ideal: guardarla hasheada
  role: String,
});

const User = mongoose.model("User", userSchema);

// Endpoint de login
app.post("/api/login", async (req, res) => {
  const { user, password } = req.body;

  try {
    // Buscar por email o rol
    const dbUser = await User.findOne({
      $or: [{ email: user }, { role: user }],
    });

    if (!dbUser) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Validar contraseña
    const isMatch = password === dbUser.password; // O con bcrypt.compare(password, dbUser.password)

   if (!(await bcrypt.compare(password, dbUser.password))) {
  return res.status(401).json({ error: "Contraseña incorrecta" });
}

    // Si es válido
    res.json({
      email: dbUser.email,
      role: dbUser.role,
    });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.listen(5000, () => {
  console.log("Servidor corriendo en http://localhost:5000 - server.js:60");
});
