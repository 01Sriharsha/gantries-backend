import multer from "multer";

export const uploadMiddleware = (mode: "single" | "multiple") => {
  // Set up Multer storage and file handling
  const storage = multer.memoryStorage(); // Use memory storage to handle files in memory

  const upload = multer({
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // Max file size 4MB
  });

  if (mode === "single") {
    return upload.single("file");
  } else if (mode === "multiple") {
    return upload.array("files", 5);
  }
};
