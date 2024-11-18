import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  chatId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'Message',
  },

  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'User',
  },
  time: {
    type: Date,
    default: Date.now(),
  },
  seen: {
    type: Boolean,
    default: false,
  },
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
