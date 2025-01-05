import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User Schema Definition
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'agent'], required: true },
}, { timestamps: true });

// Hash the password before saving it
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10); // Hash password before saving
    } catch (error) {
      return next(error); // Handle potential error while hashing
    }
  }
  next();
});

// Method to compare password (for login)
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password); // Compare password during login
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }
  const token = jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token; // Generate and return the token
};

// Export the User model
const User = mongoose.model('User', userSchema);
export default User;
