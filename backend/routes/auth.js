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
    console.log("🔍 Intento de login:", { user, password: "***" });
    
    const dbUser = await User.findOne({
      $or: [{ email: user }, { role: user }],
    });

    console.log("🔍 Usuario encontrado:", dbUser ? { email: dbUser.email, role: dbUser.role } : "No encontrado");

    if (!dbUser) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    console.log("🔍 Password hash en BD:", dbUser.password);
    const isMatch = await bcrypt.compare(password, dbUser.password);
    console.log("🔍 Password match:", isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Actualizar último acceso
    await User.findByIdAndUpdate(dbUser._id, { 
      lastLogin: new Date() 
    });

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

// Recuperación de contraseña
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    console.log("🔍 Solicitud de recuperación para:", email);
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "No se encontró una cuenta asociada a este correo electrónico" 
      });
    }

    // Generar token de recuperación (simulado)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    // Actualizar usuario con token de recuperación
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    console.log("📧 Token de recuperación generado:", resetToken);

    // Simular envío de correo (en producción usar nodemailer, SendGrid, etc.)
    const resetLink = `http://localhost:4028/reset-password?token=${resetToken}`;
    
    // Log del correo que se enviaría
    console.log(`
📧 CORREO DE RECUPERACIÓN (SIMULADO):
Para: ${email}
Asunto: Recuperación de contraseña - AudiconFlow
Contenido:
Hola,

Has solicitado restablecer tu contraseña para AudiconFlow.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetLink}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo.

Saludos,
Equipo AudiconFlow
    `);

    res.json({
      success: true,
      message: "Se ha enviado un enlace de recuperación a tu correo electrónico",
      // En desarrollo, incluir el token para pruebas
      ...(process.env.NODE_ENV === 'development' && { resetToken, resetLink })
    });

  } catch (error) {
    console.error("❌ Error en forgot-password:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor" 
    });
  }
});

// Restablecer contraseña
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    console.log("🔍 Intento de restablecimiento con token:", token);
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Token inválido o expirado" 
      });
    }

    // Actualizar contraseña
    user.password = newPassword; // El middleware pre-save se encargará del hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("✅ Contraseña restablecida para:", user.email);

    res.json({
      success: true,
      message: "Contraseña restablecida exitosamente"
    });

  } catch (error) {
    console.error("❌ Error en reset-password:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor" 
    });
  }
});

export default router;
