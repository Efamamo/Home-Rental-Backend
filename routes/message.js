import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { check } from 'express-validator';

class MessageRoutes {
  constructor(messageController) {
    this.messageController = messageController;
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/',
      authorize(['Admin', 'Seller', 'Buyer']),
      [
        check('content').notEmpty().withMessage('content is required'),
        check('recipientId').notEmpty().withMessage('recipientId is required'),
      ],
      this.messageController.addMessage
    );

    this.router.delete(
      '/:mid',
      authorize(['Admin', 'Seller', 'Buyer']),
      check('chatId').notEmpty().withMessage('chatId is required'),
      this.messageController.deleteMessage
    );

    this.router.patch(
      '/:id',
      authorize(['Admin', 'Seller', 'Buyer']),
      check('content').notEmpty().withMessage('content is required'),
      this.messageController.deleteMessage
    );
  }
}

export default MessageRoutes;
