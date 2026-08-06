import z from "zod";

export const GetMovieShowsSchema = {
  params: z.object({
    id: z
      .uuid("Valid UUID is required")
      .trim()
      .nonempty("Movie ID is required"),
  }),
  query: z.object({
    city: z.string().min(2).trim().nonempty("City is required"),
    date: z.coerce.date().transform((value) => {
      if (isNaN(value.getTime())) {
        throw new Error("Invalid date");
      }
      return value;
    }),
  }),
};
