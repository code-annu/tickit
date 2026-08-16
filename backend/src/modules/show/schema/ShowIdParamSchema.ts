import { z } from "zod";

export const ShowIdSchema = z
  .uuid("Valid UUID is required")
  .trim()
  .nonempty("Show id cannot be empty");

export const ShowIdParamSchema = z.object({
  id: ShowIdSchema,
});
