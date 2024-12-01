import { validationResult } from 'express-validator';
import Chat from '../models/chat.js';
import Message from '../models/message.js';
import { formatErrors } from '../lib/util.js';
import mongoose from 'mongoose';
import User from '../models/user.js';
import { io } from '../app.js';
import { compareAndOrderIds } from '../lib/util.js';

class MessageController {
  async addMessage(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json({ errors: formattedErrors });
      return;
    }

    const { content, recipientId } = req.body;
    const { id } = req.user;

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(422).json({ error: 'Invalid Chat ID' });
    }

    const sender = await User.findById(id);
    if (!sender) return res.status(404).json({ error: 'Sender not found' });

    if (sender.coins < 10)
      return res.status(422).json({ error: 'You dont have enough coin' });

    const user = await User.findById(recipientId);
    if (!user) return res.status(404).json({ error: 'Recipient not found' });

    if (id === recipientId) return res.sendStatus(409);
    sender.coins -= 10;
    await sender.save();

    const chat = await Chat.findOne({
      users: { $all: [id, recipientId] },
    });

    if (!chat) {
      const newChat = new Chat({
        users: [id, recipientId],
        lastUpdateTime: new Date(),
      });

      const message = new Message({
        content,
        owner: id,
        chatId: newChat._id,
      });

      newChat.lastMessage = message;
      newChat.messages.push(message);

      await newChat.save();
      await message.save();

      io.emit(`messageAdded-${compareAndOrderIds(id, recipientId)}`, {
        id: newChat._id,
        message,
      });
    } else {
      const message = new Message({
        content,
        owner: id,
        chatId: chat._id,
      });

      chat.lastMessage = message;
      chat.lastUpdateTime = new Date();
      chat.messages.push(message);
      await message.save();
      await chat.save();
      console.log(compareAndOrderIds(id, recipientId));

      io.emit(`messageAdded-${compareAndOrderIds(id, recipientId)}`, message);
    }

    res.sendStatus(201);
  }

  async updateMessage(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json({ errors: formattedErrors });
      return;
    }

    const { mid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(mid)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const message = await Message.findById(mid);

    if (!message) return res.status(404).json({ error: 'Message not found' });

    const chat = await Chat.findById(message.chatId)
      .populate('users') // Populate the 'users' field with actual User data
      .exec();

    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const { content } = req.body;
    message.content = content;

    await message.save();
    await chat.save();

    const firstUser = chat.users[0];
    const secondUser = chat.users[1];

    io.emit(
      `messageUpdated-${compareAndOrderIds(
        firstUser._id.toString(),
        secondUser._id.toString()
      )}`,
      message
    );
    res.json(message);
  }

  async deleteMessage(req, res) {
    const { mid } = req.params;
    const { id } = req.user;

    // Validate the message ID
    if (!mongoose.Types.ObjectId.isValid(mid)) {
      return res.status(422).json({ error: 'Invalid message ID' });
    }

    // Find and delete the message
    const message = await Message.findById(mid);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Assuming `req.user.id` contains the ID of the logged-in user
    if (message.owner.toString() !== id) {
      return res
        .status(403)
        .json({ error: 'Unauthorized: You are not the owner of this message' });
    }

    await message.deleteOne();

    // Find the associated chat and populate the messages
    const chat = await Chat.findById(message.chatId)
      .populate('users') // Populate the 'users' field with actual User data
      .exec();

    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Filter out the deleted message from the messages array
    chat.messages = chat.messages.filter((m) => !m._id.equals(message._id));

    if (chat.messages.length > 0) {
      const latestMessage = chat.messages.sort((a, b) => {
        return b.toString().localeCompare(a.toString());
      })[0];

      // Update the lastMessage field
      chat.lastMessage = latestMessage._id;
    } else {
      chat.lastMessage = null;
    }

    // Save the updated chat
    await chat.save();
    const firstUser = chat.users[0];
    const secondUser = chat.users[1];

    io.emit(
      `messageDeleted-${compareAndOrderIds(
        firstUser._id.toString(),
        secondUser._id.toString()
      )}`,
      message
    );

    // Respond with the deleted message
    res.json(message);
  }
}

export default MessageController;
