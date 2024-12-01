import mongoose from 'mongoose';
import User from '../models/user.js';
import Chat from '../models/chat.js';
import Message from '../models/message.js';

class ChatController {
  constructor(io) {
    this.io = io;
  }

  async getChat(req, res) {
    
    const user2id = req.query.user;
    const user1id = req.user.id;

    if (user2id) {
      if (
        !mongoose.Types.ObjectId.isValid(user2id) ||
        !mongoose.Types.ObjectId.isValid(user1id)
      ) {
        return res.status(400).json({ error: 'Invalid User Id' });
      }

      if (user2id === user1id) {
        return res.sendStatus(409);
      }

      const user2 = await User.findById(user2id);
      const user1 = await User.findById(user1id);

      if (!user2) return res.status(404).json({ error: 'User not found' });

      const chat = await Chat.findOne({
        users: { $all: [user1id, user2id] },
      })
        .populate('messages')
        .populate('users')
        .populate('lastMessage');

      if (!chat) {
        return res.json({
          users: [user1, user2],
          lastMessage: '',
          messages: [],
          lastUpdateTime: '',
        });
      }

      return res.json(chat);
    }

    console.log(user1id);

    const chats = await Chat.find({
      users: { $in: [user1id] },
    })
      .populate('messages')
      .populate('users')
      .populate('lastMessage');

    res.json(chats);
  }

  async deleteChat(req, res) {
    const user2id = req.query.user;
    const user1id = req.user.id;

    if (!user2id) {
      return res.status(400).json({ error: 'User 2 is required' });
    }

    if (
      !mongoose.Types.ObjectId.isValid(user2id) ||
      !mongoose.Types.ObjectId.isValid(user1id)
    ) {
      return res.status(400).json({ error: 'Invalid User Id' });
    }

    if (user2id === user1id) {
      return res.sendStatus(409);
    }

    const chat = await Chat.findOneAndDelete({
      users: { $all: [user1id, user2id] },
    });

    const messages = chat.messages;

    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    if (messages.length > 0) {
      await Message.deleteMany({
        _id: { $in: messages },
      });
    }

    res.sendStatus(204);
  }
}

export default ChatController;
