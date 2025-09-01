import express from "express";
import User from "../models/Users.js";

const router = express.Router();

// Helper function para formatear el último acceso
const formatLastLogin = (lastLogin) => {
  if (!lastLogin) return "Nunca";
  
  const now = new Date();
  const loginDate = new Date(lastLogin);
  const diffInMs = now - loginDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Hace un momento";
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  if (diffInDays < 30) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  
  return loginDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ✅ Obtener todos los usuarios
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Excluir password
    
    // Formatear lastLogin para cada usuario
    const usersWithFormattedLogin = users.map(user => ({
      ...user.toObject(),
      lastLoginFormatted: formatLastLogin(user.lastLogin)
    }));
    
    res.json(usersWithFormattedLogin);
  } catch (err) {
    console.error("❌ Error al obtener usuarios - users.js:10", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// ✅ Obtener un usuario por ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Error al obtener usuario - users.js:22", err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// ✅ Crear nuevo usuario
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role, department, phone, status, permissions } = req.body;

    // Validar campos requeridos
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Nombre, email y rol son requeridos" });
    }

    // Validar contraseña
    if (!password) {
      return res.status(400).json({ error: "La contraseña es requerida" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    
    const newUser = new User({
      name,
      email,
      password: password,
      role,
      department,
      phone,
      status: status || "Activo",
      permissions: permissions || []
    });

    await newUser.save();

    // Responder sin password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      ...userResponse,
      message: "Usuario creado exitosamente ✅"
    });
  } catch (err) {
    console.error("❌ Error al crear usuario - users.js:58", err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// ✅ Actualizar usuario
router.put("/users/:id", async (req, res) => {
  try {
    const { name, email, password, role, department, phone, status, permissions } = req.body;

    // Verificar si el usuario existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si el email ya existe en otro usuario
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ error: "El email ya está registrado por otro usuario" });
      }
    }

    // Validar contraseña si se proporciona
    if (password && password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Actualizar campos
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password; // Solo actualizar si se proporciona
    if (role) updateData.role = role;
    if (department) updateData.department = department;
    if (phone) updateData.phone = phone;
    if (status) updateData.status = status;
    if (permissions) updateData.permissions = permissions;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: { password: 0 } }
    );

    res.json({
      ...updatedUser.toObject(),
      message: "Usuario actualizado exitosamente ✅"
    });
  } catch (err) {
    console.error("❌ Error al actualizar usuario - users.js:96", err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// ✅ Eliminar usuario
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "Usuario eliminado exitosamente ✅",
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("❌ Error al eliminar usuario - users.js:118", err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// ✅ Actualizar múltiples usuarios (para acciones en lote)
router.patch("/users/bulk", async (req, res) => {
  try {
    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de IDs de usuarios" });
    }

    let updateData = {};
    
    switch (action) {
      case 'activate':
        updateData.status = 'Activo';
        break;
      case 'deactivate':
        updateData.status = 'Inactivo';
        break;
      case 'suspend':
        updateData.status = 'Suspendido';
        break;
      default:
        return res.status(400).json({ error: "Acción no válida" });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    res.json({
      message: `${result.modifiedCount} usuarios actualizados exitosamente ✅`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("❌ Error en actualización masiva - users.js:152", err);
    res.status(500).json({ error: "Error en actualización masiva" });
  }
});

// ✅ Eliminar múltiples usuarios
router.delete("/users/bulk", async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de IDs de usuarios" });
    }

    const result = await User.deleteMany({ _id: { $in: userIds } });

    res.json({
      message: `${result.deletedCount} usuarios eliminados exitosamente ✅`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ Error en eliminación masiva - users.js:171", err);
    res.status(500).json({ error: "Error en eliminación masiva" });
  }
});

export default router;
