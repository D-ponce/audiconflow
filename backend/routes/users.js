import express from "express";
import User from "../models/Users.js";

const router = express.Router();

// ✅ Obtener todos los usuarios
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Excluir password
    res.json(users);
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

    // Actualizar campos usando save() para que se ejecute el middleware de cifrado
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // El middleware pre-save cifrará la contraseña
    if (role) user.role = role;
    if (department) user.department = department;
    if (phone) user.phone = phone;
    if (status) user.status = status;
    if (permissions) user.permissions = permissions;

    const updatedUser = await user.save();

    // Responder sin password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({
      ...userResponse,
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
