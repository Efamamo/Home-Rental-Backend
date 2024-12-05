import mongoose from 'mongoose';

const coinSchema = new mongoose.Schema({
  coins: {
    type: Number,
    required: true,
  },

  user: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'User',
  },
});

export const Coin = mongoose.model('Coin', coinSchema);
