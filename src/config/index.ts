import dotenv from "dotenv";

//loads .env
dotenv.config();

export const config = {
  /** MongoDB connection string */
  mongodb_uri: process.env.MONGO_URI!,
  /** JWT secret key */
  jwt_secret: process.env.JWT_SECRET!,
  /** Port that server should run */
  port: process.env.PORT!,
  /** Server running environment */
  environment: process.env.NODE_ENV!,
  /**  Client url */
  client_url: process.env.CLIENT_URL || "http://localhost:3000",
  /**
   * API Configs
   */
  api: {
    /** api prefix */
    prefix: "/api" as const,
  },
  /** Google OAuth Credentials */
  google: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID!,
      secret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  /** Google OAuth Credentials */
  mail: {
    admin: {
      mail: process.env.ADMIN_EMAIL!,
      password: process.env.ADMIN_EMAIL_PASSWORD!,
    },
    port: process.env.MAIL_PORT!,
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
  },
};
