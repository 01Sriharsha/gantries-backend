import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";
import { uploadFile } from "../util/uploadfile";

export const uploadMultiple = asyncHandler(async (req: AuthRequest, res) => {
  const files = req.files as Express.Multer.File[];
  const fileUrls: string[] = [];

  if (files) {
    for (const file of files) {
      const result = await uploadFile(file);
      if (result.error) continue;
      else if (result.data) {
        fileUrls.push(result.data.url);
      }
    }
  }

  return apiResponse(res, 200, {
    message: "Files uploaded successfully",
    data: fileUrls,
  });
});

export const uploadSingle = asyncHandler(async (req: AuthRequest, res) => {
  const file = req.file as Express.Multer.File;

  const result = await uploadFile(file);
  if (result.error) {
    return apiResponse(res, 500, { message: "Failed to upload the file" });
  }
  return apiResponse(res, 200, {
    message: "File uploaded successfully",
    data: result.data.url,
  });
});
