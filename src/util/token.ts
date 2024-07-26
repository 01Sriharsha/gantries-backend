import jwt from "jsonwebtoken";

/** Generates a JWT token */
export const generateToken = async (id: string, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
};
