import { Response } from "express";

type ResponseBody = {
  message?: string;
  data?: any;
};

export const apiResponse = (
  res: Response,
  status: number,
  body: ResponseBody
) => {
  return res.status(status).json(body);
};
