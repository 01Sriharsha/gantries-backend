import { UserModel } from "./user.model";
import { StudentModel } from "./student.model";
import { CommunityModel } from "./community.model";
import { PostModel } from "./post.model";
import { CommentModel } from "./comment.model";
import { TagModel } from "./tag.model";

//Register all the models here

/** Provides registered models */
export const db = {
  User: UserModel,
  Student: StudentModel,
  Community: CommunityModel,
  Post: PostModel,
  Comment: CommentModel,
  Tag : TagModel
};
