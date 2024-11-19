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
    /**
     * @swagger
     * tags:
     *   name: Messages
     *   description: Messages end point
     */

    /**
     * @swagger
     * /messages:
     *   post:
     *     summary: Add Message
     *     tags: [Messages]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               content:
     *                 type: string
     *                 description: The content to be sent.
     *               recipientId:
     *                 type: string
     *                 description: The  Id of the reciever.
     *
     *     responses:
     *       201:
     *         description: Message sent successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                   description: Id of the new message.
     *                 content:
     *                  type: string
     *                  description: The content to be sent.
     *                 recipientId:
     *                   type: string
     *                   description: The  Id of the reciever.
     *                 time:
     *                   type: string,
     *                   description: Messages Created time.
     *                 seen:
     *                   type: boolean
     *                   description: Where the message is seen or not.
     *       400:
     *         description: Validation error.
     *       422:
     *         description: Invalid Chat Id
     *       404:
     *         description: Sender or Reciever not found
     *
     */
    this.router.post(
      '/',
      authorize(['Admin', 'Seller', 'Buyer']),
      [
        check('content').notEmpty().withMessage('content is required'),
        check('recipientId').notEmpty().withMessage('recipientId is required'),
      ],
      this.messageController.addMessage
    );

    /**
     * @swagger
     * /messages/{id}:
     *   delete:
     *     summary: Delete Message
     *     tags: [Messages]
     *
     *
     *     responses:
     *       200:
     *         description: Message deleted successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                   description: Id of the new message.
     *                 content:
     *                  type: string
     *                  description: The content to be sent.
     *                 recipientId:
     *                   type: string
     *                   description: The  Id of the reciever.
     *                 time:
     *                   type: string,
     *                   description: Messages Created time.
     *                 seen:
     *                   type: boolean
     *                   description: Where the message is seen or not.
     *       400:
     *         description: Validation error.
     *       422:
     *         description: Invalid Message Id
     *       404:
     *         description: Message or Chat not found
     *
     */

    this.router.delete(
      '/:mid',
      authorize(['Admin', 'Seller', 'Buyer']),
      check('chatId').notEmpty().withMessage('chatId is required'),
      this.messageController.deleteMessage
    );

    /**
     * @swagger
     * /messages/{id}:
     *   patch:
     *     summary: Add Message
     *     tags: [Messages]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               content:
     *                 type: string
     *                 description: The content to be sent.
    
     *
     *     responses:
     *       200:
     *         description: Message sent successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                   description: Id of the new message.
     *                 content:
     *                  type: string
     *                  description: The content to be sent.
     *                 recipientId:
     *                   type: string
     *                   description: The  Id of the reciever.
     *                 time:
     *                   type: string,
     *                   description: Messages Created time.
     *                 seen:
     *                   type: boolean
     *                   description: Where the message is seen or not.
     *       400:
     *         description: Validation error.
     *       422:
     *         description: Invalid Message Id
     *       404:
     *         description: Message not found
     *
     */

    this.router.patch(
      '/:id',
      authorize(['Admin', 'Seller', 'Buyer']),
      check('content').notEmpty().withMessage('content is required'),
      this.messageController.deleteMessage
    );
  }
}

export default MessageRoutes;
