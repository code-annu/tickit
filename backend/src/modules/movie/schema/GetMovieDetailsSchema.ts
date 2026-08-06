import { z } from "zod";

export const GetMovieDetailsSchema = {
  params: z.object({
    id: z
      .uuid("Valid UUID is required")
      .trim()
      .nonempty("Movie ID is required"),
  }),
};
