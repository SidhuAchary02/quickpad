import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true,
    lowercase: true
  },
  password_hash: { 
    type: String, 
    required: true 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Instance method to verify password
userSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

export const User = mongoose.model('User', userSchema);
