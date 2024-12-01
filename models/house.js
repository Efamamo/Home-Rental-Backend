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
  number_of_bedrooms: {
    type: Number,
    required: true,
  },
  number_of_bathrooms: {
    type: Number,
    required: true,
  },
  number_of_floors: {
    type: Number,
    required: true,
  },
  for_rent: {
    type: Boolean,
    required: true,
  },
  ownerId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'User',
  },
  category: {
    type: String,
    required: true,
  },
  sub_category: {
    type: String,
  }
  
});

export const House = mongoose.model('House', houseSchema);
