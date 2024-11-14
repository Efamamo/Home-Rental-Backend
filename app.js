import express from 'express';
import dotenv from 'dotenv';
import connectToDB from './database/mongoose.js';
import authRouter from './routes/auth.js';
import houseRouter from './routes/house.js';
dotenv.config();

const app = express();
app.use(express.json());
connectToDB();

app.use('/uploads/images', express.static('uploads/images'));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/houses', houseRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(process.env.PORT, () => {
  console.log(`Listening at port ${process.env.PORT}`);
});
