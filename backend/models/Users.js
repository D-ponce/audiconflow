import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["administrador", "auditor", "supervisor"],
    default: "auditor" 
  },
  department: { type: String },
  phone: { type: String },
  status: { 
    type: String, 
    enum: ["Activo", "Inactivo", "Suspendido"],
    default: "Activo" 
  },
  permissions: [{ type: String }],
  lastLogin: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre("save", async function (next) {
  try {
    // Solo procesar si la contraseña fue modificada
    if (!this.isModified("password")) return next();
    
    // Verificar si la contraseña ya está cifrada (evitar re-cifrar)
    if (this.password && this.password.startsWith('$2b$')) {
      console.log(`ℹ️  Contraseña ya cifrada para usuario: ${this.email}`);
      return next();
    }
    
    console.log(`🔐 Cifrando contraseña para usuario: ${this.email}`);
    
    // Cifrar la contraseña con salt rounds 12 para mayor seguridad
    this.password = await bcrypt.hash(this.password, 12);
    
    console.log(`✅ Contraseña cifrada exitosamente para: ${this.email}`);
    next();
  } catch (error) {
    console.error(`❌ Error al cifrar contraseña para usuario ${this.email}:`, error);
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
