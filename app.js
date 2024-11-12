import express from 'express';
import dotenv from 'dotenv';
import connectToDB from './database/mongoose.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
connectToDB();

app.use('/api/v1/auth', authRouter);

app.listen(process.env.PORT, () => {
  console.log(`Listening at port ${process.env.PORT}`);
});
