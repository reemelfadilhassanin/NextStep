// models/user.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Check if the model already exists in mongoose and reuse it if it does
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
  },
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate the JWT token
userSchema.methods.generateAuthToken = function () {
  const payload = {
    user: {
      id: this._id,
      email: this.email,
      role: this.role,
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Use `mongoose.models.User` to prevent overwriting
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
