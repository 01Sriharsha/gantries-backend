import { Router } from "express";
import {
  createCollege,
  getAllColleges,
} from "../controllers/college.controller";

/** College data Routes */
export const collegeRouter = (): Router => {
  const router = Router();

  router.get("/", getAllColleges);
  router.post("/", createCollege);

  return router;
};
