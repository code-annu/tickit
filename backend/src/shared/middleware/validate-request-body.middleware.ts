import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import BadRequestError from "../error/types/BadRequestError";
import ErrorCode from "../error/ErrorCode";

export const validateRequestBody =
  (schema: ZodObject<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestError(
        "Missing or invalid request body",
        ErrorCode.INVALID_REQUEST,
        result.error.issues.map((issue) => ({
          message: issue.message,
          field: issue.path,
        })),
      );
    }

    req.body = result.data;

    next();
  };
