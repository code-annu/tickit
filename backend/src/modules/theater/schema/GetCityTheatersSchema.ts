import { z } from "zod";

export const GetCityTheatersSchema = {
  query: z.object({
    city: z
      .string("City query is required")
      .min(2)
      .trim()
      .nonempty("City cannot be empty"),
  }),
};
