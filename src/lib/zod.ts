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
  age: z.number().int().min(0, { message: "Age must be a positive integer" }),
  gender: z
    .string()
    .min(1, { message: "Gender is required" })
    .max(50, { message: "Gender should not exceed 50 characters" }),
  institution: z.string().min(1, { message: "Institution is required" }),
  qualification: z.string().min(1, { message: "Qualification is required" }),
  fieldOfStudy: z.string().min(1, { message: "Field Of Study is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  interests: z
    .array(z.string())
    .nonempty({ message: "At least one interest is required" }),
  bio: z
    .string()
    .max(500, { message: "Bio should not exceed 500 characters" })
    .optional(),
  profilePicture: z.string().optional(),
  socialLinks: z
    .array(z.string().url({ message: "Invalid URL in social links" }))
    .nonempty({ message: "At least one social link is required" })
    .optional(),
});

export type UserSchema = z.infer<typeof UserSchema>;
export type StudentSchema = z.infer<typeof StudentSchema>;
export type LoginSchema = z.infer<typeof LoginSchema>;
