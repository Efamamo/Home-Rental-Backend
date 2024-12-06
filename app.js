import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import connectToDB from './database/mongoose.js';
import { setupSwagger } from './lib/swagger.js';
import AuthRoutes from './routes/auth.js';
import { AuthController } from './controllers/auth.js';
import { HouseController } from './controllers/house.js';
import MessageController from './controllers/message.js';
import MessageRoutes from './routes/message.js';
import ChatController from './controllers/chat.js';
import ChatRoutes from './routes/chat.js';
import { Server } from 'socket.io';
import HouseRoutes from './routes/house.js';
import { handleSocket } from './lib/util.js';
import CoinRoutes from './routes/coins.js';
import { CoinsController } from './controllers/coins.js';
dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(express.json());
connectToDB();

const authController = new AuthController();
const authRoutes = new AuthRoutes(authController);

const messageController = new MessageController();
const messageRouter = new MessageRoutes(messageController);

const chatController = new ChatController();
const chatRouter = new ChatRoutes(chatController);

const coinControler = new CoinsController();
const coinRouter = new CoinRoutes(coinControler);

const houseController = new HouseController();
const houseRouter = new HouseRoutes(houseController);

app.use(
  '/uploads/images',
  express.static(path.join(__dirname, 'uploads/images'))
);
app.use('/api/v1/auth', authRoutes.router);
app.use('/api/v1/houses', houseRouter.router);
app.use('/api/v1/chats', chatRouter.router);
app.use('/api/v1/messages', messageRouter.router);
app.use('/api/v1/coins', coinRouter.router);

setupSwagger(app);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(process.env.PORT, () => {
  console.log(`Listening at port ${process.env.PORT}`);
});
