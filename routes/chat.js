import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import ChatController from '../controllers/chat.js';

class ChatRoutes {
  constructor(chatController) {
    this.router = Router();
    this.chatController = chatController;
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      '/',
      authorize(['Admin', 'Seller', 'Buyer']),
      this.chatController.getChat
    );

    this.router.delete(
      '/',
      authorize(['Admin', 'Seller', 'Buyer']),
      this.chatController.deleteChat
    );
  }
}

export default ChatRoutes;
