import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/Users.js";

const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const newUser = new User({ email, password, role });
    await newUser.save();

    res.status(201).json({
      email: newUser.email,
      role: newUser.role,
      message: "Usuario registrado con éxito ✅"
    });
  } catch (err) {
    console.error("❌ Error en /register - auth.js:26", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Login de usuario
router.post("/login", async (req, res) => {
  const { user, password } = req.body; // "user" puede ser email o role

  try {
    const dbUser = await User.findOne({
      $or: [{ email: user }, { role: user }],
    });

    if (!dbUser) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, dbUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      email: dbUser.email,
      role: dbUser.role,
      message: "Login exitoso ✅"
    });
  } catch (err) {
    console.error("❌ Error en /login - auth.js:55", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
