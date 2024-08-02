import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types";

type RequestHandler = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<Response<any, Record<string, any>> | void | any>

export const asyncHandler = (requestHanlder: RequestHandler) => {
  return (req: Request | AuthRequest, res: Response, next: NextFunction) => {
    Promise.resolve(requestHanlder(req, res, next)).catch((err) => next(err));
  };
};
