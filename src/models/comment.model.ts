import { Schema, model, Document } from "mongoose";
import { IUser } from "./user.model";
import { IPost } from "./post.model";

export interface IComment extends Document {
  content: string;
  createdBy: IUser["_id"];
  post: IPost["_id"];
  likes: IUser["_id"][];
  replies: IComment["_id"][];
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

export const CommentModel = model<IComment>("Comment", commentSchema);
