import { Schema, model, Document } from 'mongoose';
import { IConversation } from './conversation.model';
import { IUser } from './user.model';

export interface IMessage extends Document {
  receiverId: IConversation['_id'];
  sender: IUser['_id'];
  content: string;
  sentAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const MessageModel = model<IMessage>('Message', messageSchema);
