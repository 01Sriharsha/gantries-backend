// src/models/FriendRequest.ts
import { Schema, Document, model } from 'mongoose';
import { IUser } from "./user.model";
// FriendRequest Type Definition
export interface IFriendRequest extends Document {
  sender: IUser["_id"];
  receiver: IUser["_id"];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// FriendRequest Schema
const friendRequestSchema = new Schema<IFriendRequest>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const FriendRequest = model<IFriendRequest>('FriendRequest', friendRequestSchema);
