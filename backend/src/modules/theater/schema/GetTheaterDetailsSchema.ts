import { z } from "zod";

export const GetTheaterDetailsSchema = {
  params: z.object({
    id: z
      .uuid("Valid UUID is required")
      .trim()
      .nonempty("Theater ID is required"),
  }),
};
