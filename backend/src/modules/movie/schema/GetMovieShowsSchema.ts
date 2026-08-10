import { z } from "zod";
import { MovieIdParamSchema } from "./MovieIdParamSchema";

export const GetMovieShowsSchema = {
  params: MovieIdParamSchema,
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

