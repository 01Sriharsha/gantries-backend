import { UTApi } from "uploadthing/server";
import { config } from "../config";
import { randomUUID } from "crypto";

const utapi = new UTApi({
  apiKey: config.uploadthing.secret,
  logLevel: "info",
});

export const uploadFile = async (file: Express.Multer.File) => {
  const res = await utapi.uploadFiles(new File([file.buffer], randomUUID()));
  if (res.error) {
    console.error("❌ Image upload error:", res.error);
  }
  return res;
};
