import { z } from "zod";

export const TheaterIdSchema = z
  .uuid("Valid UUID is required")
  .trim()
  .nonempty("Theater id cannot be empty");

export const TheaterIdParamSchema = z.object({
  id: TheaterIdSchema,
});
