import { z } from "zod";

export const MovieIdSchema = z
  .uuid("Valid UUID is required")
  .trim()
  .nonempty("Movie id cannot be empty");

export const MovieIdParamSchema = z.object({
  id: MovieIdSchema,
});
