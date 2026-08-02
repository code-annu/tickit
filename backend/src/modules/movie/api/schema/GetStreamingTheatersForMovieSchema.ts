import z from "zod";

export const GetStreamingTheatersForMovieSchema = {
  query: z.object({
    city: z.string("City is required").trim().nonempty("City cannot be empty"),
    date: z.coerce
      .date("Date must be a valid date")
      .refine((date) => date >= new Date(), "Date cannot be in the past"),
  }),
  params: z.object({
    movieId: z.uuid("Movie id must be a valid uuid"),
  }),
};
