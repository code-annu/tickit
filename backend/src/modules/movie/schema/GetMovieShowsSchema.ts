import { z } from "zod";
import { MovieIdParamSchema } from "./MovieIdParamSchema";

export const GetMovieShowsSchema = {
  params: MovieIdParamSchema,
  query: z.object({
    city: z
      .string("City is required")
      .min(2)
      .trim()
      .nonempty("City cannot be empty"),
    date: z.iso
      .date("Date is required")
      .trim()
      .nonempty("Date cannot be empty"),
  }),
};
