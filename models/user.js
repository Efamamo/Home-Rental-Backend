import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
  },
  otp: { type: Number },
  otpExpiration: { type: Date },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: Number },
  resetPasswordExpires: { type: Date },
});

const User = mongoose.model('User', userSchema);

export default User;
