import { z } from "zod";
import { TheaterIdParamSchema } from "./TheaterIdParamSchema";

export const GetTheaterShowsSchema = {
  params: TheaterIdParamSchema,
  query: z.object({
    date: z.iso
      .date("Date is required")
      .trim()
      .nonempty("Date cannot be empty"),
  }),
};
