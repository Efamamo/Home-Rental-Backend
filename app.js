import express from 'express';
import dotenv from 'dotenv';
import connectToDB from './database/mongoose.js';
import houseRouter from './routes/house.js';
import { setupSwagger } from './lib/swagger.js';
import AuthRoutes from './routes/auth.js';
import { AuthController } from './controllers/auth.js';
dotenv.config();

const app = express();
app.use(express.json());
connectToDB();

const authController = new AuthController();
const authRoutes = new AuthRoutes(authController);

app.use('/uploads/images', express.static('uploads/images'));
app.use('/api/v1/auth', authRoutes.router);
app.use('/api/v1/houses', houseRouter);
setupSwagger(app);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(process.env.PORT, () => {
  console.log(`Listening at port ${process.env.PORT}`);
});
