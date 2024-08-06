import { Schema, model, Document } from "mongoose";
import { IUser } from "./user.model";
import { ICommunity } from "./community.model";
import { IComment } from "./comment.model";
import { ITag } from "./tag.model";

export interface IPost extends Document {
  title: string;
  content: string;
  likeCount: number;
  createdBy: IUser["_id"];
  community: ICommunity["_id"];
  likes: IUser["_id"][];
  comments: IComment["_id"][];
  shares: IUser["_id"][];
  tags: ITag["_id"][];
  images: string[];
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likeCount: {
      type: Number,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    images: [
      {
        type: String,
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

export const PostModel = model<IPost>("Post", postSchema);
