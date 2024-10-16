import { Schema, model, Document } from 'mongoose';
import { IUser } from './user.model';

export interface IConversation extends Document {
  participants: IUser['_id'][];
}

const conversationSchema = new Schema<IConversation>({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
});

export const conversationModel = model<IConversation>('Conversation', conversationSchema);
