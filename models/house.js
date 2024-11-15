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
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  sub_category: {
    type: String,
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
});

export const House = mongoose.model('House', houseSchema);
