import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

let isConnected = false;

export default async function connectToDB() {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URL) {
    console.log('MONGODB_URL is required');
    return;
  }

  if (isConnected) return 'Already Connected to DB';

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log('Connected to DB');
  } catch (e) {
    console.log(e);
  }
}
