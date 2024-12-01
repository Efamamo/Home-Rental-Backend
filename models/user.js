import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
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

  profile_pic: {
    type: String,
    default: null,
  },
  average_rating: {
    type: Number,
    default: 0,
  },
  total_people: {
    type: Number,
    default: 0,
  },
  total_amount: {
    type: Number,
    default: 0,
  },
  raters: {
    type: Map,
    of: Number,
    default: {},
  },
  coins: {
    type: Number,
    default: 100
  }
});

const User = mongoose.model('User', userSchema);

export default User;
