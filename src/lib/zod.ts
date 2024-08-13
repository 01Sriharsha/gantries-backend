import { z } from "zod";
export const UserSchema = z.object({
  firstname: z
    .string({ required_error: "Firstname is required" })
    .max(50, { message: "Firstname should not exceed 50 characters" }),
  lastname: z
    .string({ required_error: "Lastname is required" })
    .max(50, { message: "Lastname should not exceed 50 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  phone: z.string().length(10, { message: "Invalid phone number" }),
});

export const LoginSchema = z.object({
  phone: z.string({ required_error: "Email is required" }),
  password: z.string({ required_error: "Password is required" }),
});

export const StudentSchema = z.object({
  user_id: z.string().nonempty({ message: "User ID is required" }),
  dateOfBirth: z.string().nonempty({ message: "Date of birth is required" }),
  college: z.string().nonempty({ message: "College is required" }),
  yearOfEnding: z.string().nonempty({ message: "Year of ending is required" }),
  course: z.string().nonempty({ message: "Course is required" }),
  interests: z
    .array(z.string())
    .nonempty({ message: "At least one interest is required" }).optional(),
  bio: z
    .string()
    .max(500, { message: "Bio should not exceed 500 characters" })
    .optional(),
  aim: z.string().nonempty({ message: "Aim is required" }),
  plan: z.string().nonempty({ message: "Plan is required" }),
  gender: z.string().optional(),
  profilePicture: z.string().optional(),
  socialLinks: z
    .array(z.string().url({ message: "Invalid URL in social links" }))
    .optional(),
});

export type UserSchema = z.infer<typeof UserSchema>;
export type StudentSchema = z.infer<typeof StudentSchema>;
export type LoginSchema = z.infer<typeof LoginSchema>;
