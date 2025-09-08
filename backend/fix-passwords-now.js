import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Esquema directo
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  phone: String,
  status: String,
  permissions: [String],
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function fixPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/audiconflow');
    
    const users = await User.find({});
    
    for (const user of users) {
      if (user.password && !user.password.startsWith('$2b$')) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        await User.updateOne({ _id: user._id }, { password: hashedPassword });
        console.log(`Cifrada: ${user.email}`);
      }
    }
    
    console.log('Completado');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPasswords();
