import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./index";
import { connectDB } from "../lib/db";
import { errorHandler } from "../middleware/error.middleware";
import { globalRouter } from "../routes";
import { OAuthConfig } from "../lib/passport";

export const loaders = async ({
  app,
}: {
  app: express.Application;
}): Promise<void> => {
  //connect to database
  await connectDB();

  //For JSON parse
  app.use(express.json());

  //Enable cors
  app.use(cors({ credentials: true, origin: config.client_url }));

  //For cookie parse
  app.use(cookieParser());

  //Enable Passport(OAuth)
  app.use(OAuthConfig.initialize());

  //Global error handler
  app.use(errorHandler);

  //Global Router
  app.use(config.api.prefix, globalRouter());
};
