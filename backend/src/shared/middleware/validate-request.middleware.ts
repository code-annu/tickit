import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import BadRequestError from "../error/types/BadRequestError";
import ErrorCode from "../error/ErrorCode";

interface ValidationSchemas {
  body?: ZodObject<any>;
  query?: ZodObject<any>;
  params?: ZodObject<any>;
}

export const validateRequest =
  (schemas: ValidationSchemas) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
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
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        throw new BadRequestError(
          "Missing or invalid query parameters",
          ErrorCode.INVALID_REQUEST,
          result.error.issues.map((issue) => ({
            message: issue.message,
            field: issue.path,
          })),
        );
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        throw new BadRequestError(
          "Missing or invalid path parameters",
          ErrorCode.INVALID_REQUEST,
          result.error.issues.map((issue) => ({
            message: issue.message,
            field: issue.path,
          })),
        );
      }
    }

    next();
  };
