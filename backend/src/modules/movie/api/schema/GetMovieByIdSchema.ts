import z from "zod";

export const GetMovieByIdSchema = {
  params: z.object({
    movieId: z.uuid("Movie id should be a valid uuid").trim(),
  }),
};
