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
    /**
     * @swagger
     * tags:
     *   name: Chats
     *   description: Chats end point
     */

    /**
     * @swagger
     * /chats:
     *   get:
     *     summary: Fetch Chats
     *     tags: [Chats]
     *     parameters:
     *       - in: query
     *         name: user
     *         schema:
     *           type: string
     *           description: The user ID to fetch the chat with.
     *           example: 60f7a8b5e5f1b341d88c1b12
     *     responses:
     *       200:
     *         description: Chat(s) fetched successfully.
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - type: object
     *                   description: Single chat fetched.
     *                   properties:
     *                     users:
     *                       type: array
     *                       description: Array of user IDs participating in the chat.
     *                       items:
     *                         type: string
     *                     messages:
     *                       type: array
     *                       description: Array of message IDs in the chat.
     *                       items:
     *                         type: string
     *                     lastMessageId:
     *                       type: string
     *                       description: The ID of the last message sent in the chat.
     *                     lastUpdated:
     *                       type: string
     *                       format: date-time
     *                       description: The last time the chat was updated.
     *                 - type: array
     *                   description: Array of all chats when no `userId` is provided.
     *                   items:
     *                     type: object
     *                     properties:
     *                       users:
     *                         type: array
     *                         description: Array of user IDs participating in the chat.
     *                         items:
     *                           type: string
     *                       messages:
     *                         type: array
     *                         description: Array of message IDs in the chat.
     *                         items:
     *                           type: string
     *                       lastMessageId:
     *                         type: string
     *                         description: The ID of the last message sent in the chat.
     *                       lastUpdated:
     *                         type: string
     *                         format: date-time
     *                         description: The last time the chat was updated.
     *       400:
     *         description: Validation error.
     *       422:
     *         description: Invalid userId parameter.
     *       404:
     *         description: Chat(s) not found.
     */

    this.router.get(
      '/',
      authorize(['Admin', 'Seller', 'Buyer']),
      this.chatController.getChat
    );

    /**
     * @swagger
     * /chats:
     *   delete:
     *     summary: Delete a Chat
     *     tags: [Chats]
     *     parameters:
     *       - in: query
     *         name: user
     *         schema:
     *           type: string
     *           description: The user ID of the chat participant to delete the chat with.
     *           example: 60f7a8b5e5f1b341d88c1b12
     *         required: true
     *     responses:
     *       204:
     *         description: Chat deleted successfully.
     *       400:
     *         description: Validation error, such as missing or invalid `user` query parameter.
     *       404:
     *         description: Chat not found.
     *       409:
     *         description: Conflict. Cannot delete a chat with yourself.
     */

    this.router.delete(
      '/',
      authorize(['Admin', 'Seller', 'Buyer']),
      this.chatController.deleteChat
    );
  }
}

export default ChatRoutes;
