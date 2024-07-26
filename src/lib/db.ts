import mongoose from "mongoose";
import { config } from "../config";

/** Connects to the database instance */
export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb_uri, { autoCreate: true });
    console.log("Connection to database successfull✅");
  } catch (error) {
    console.log("\nError ocuured while connecting to database!❌\n");
    console.error(error);
    process.exit(1);
  }
};
