import jwt from "jsonwebtoken";

/** Generates a JWT token */
export const generateJWTToken = async (id: string, phone: string) => {
  return jwt.sign({ id, phone }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
};

/** Generates 6 digit email verification token */
export const generateVerificationOTP = () => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return otp;
};
