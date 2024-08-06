import { Schema, model, Document } from "mongoose";
import { IUser } from "./user.model";
import { ITag } from "./tag.model";

export interface ICommunity extends Document {
  name: string;
  description: string;
  createdBy: IUser["_id"];
  members: IUser["_id"][];
  picture?: string;
  subscribers: IUser["_id"][];
  tags: ITag["_id"][];
}

const communitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    picture: {
      type: String,
      default: "",
    },
    subscribers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  { timestamps: true }
);

export const CommunityModel = model<ICommunity>("Community", communitySchema);
