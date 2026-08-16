import { z } from "zod";
import { ShowIdParamSchema } from "./ShowIdParamSchema";

const HoldShowSeatsBodySchema = z.object({
  showSeatIds: z
    .array(z.uuid("Each showSeatId must be a valid UUID"))
    .min(1, "At least one seat must be selected")
    .max(10, "At most 10 seats can be selected at a time")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate seat IDs are not allowed",
    }),
});

export const HoldShowSeatsSchema = {
  params: ShowIdParamSchema,
  body: HoldShowSeatsBodySchema,
};
