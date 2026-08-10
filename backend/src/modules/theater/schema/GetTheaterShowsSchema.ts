import { z } from "zod";

export const GetTheaterShowsSchema = {
  params: z.object({
    id: z
      .uuid("Valid UUID is required")
      .trim()
      .nonempty("Theater ID is required"),
  }),
  query: z.object({
    date: z.coerce.date().transform((value) => {
      if (isNaN(value.getTime())) {
        throw new Error("Invalid date");
      }
      return value;
    }),
  }),
};
