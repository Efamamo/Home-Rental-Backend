import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  main_image: {
    type: String,
    required: true,
  },
  sub_images: [
    {
      type: String,
    },
  ],
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  for_sell: {
    type: Boolean,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
  },
});

export const House = mongoose.model('House', houseSchema);
