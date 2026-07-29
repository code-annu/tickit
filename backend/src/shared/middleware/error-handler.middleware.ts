import { NextFunction, Request, Response } from "express";
import AppError from "../error/AppError";
import ErrorCode from "../error/ErrorCode";

export default function handleError(
  error: Error,
  _: Request,
  res: Response,
  next: NextFunction,
) {
  // console.log(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER,
      message: error.message,
    },
  });

  next();
}
