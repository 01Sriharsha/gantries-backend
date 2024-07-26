import { UserModel } from "./user.model";
import { StudentModel } from "./student.model";

//Register all the models here

/** Provides registered models */
export const db = {
  User: UserModel,
  Student: StudentModel,
};
