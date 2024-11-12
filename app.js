import express from 'express';
import dotenv from 'dotenv';
import connectToDB from './database/mongoose.js';

dotenv.config();

const app = express();
connectToDB();

app.listen(process.env.PORT, () => {
  console.log(`Listening at port ${process.env.PORT}`);
});
