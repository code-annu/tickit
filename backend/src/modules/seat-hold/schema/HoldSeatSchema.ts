import { z } from "zod";

const HoldSeatBodySchema = z.object({
  showId: z.uuid("showId must be a valid UUID"),
  showSeatIds: z
    .array(z.uuid("Each showSeatId must be a valid UUID"))
    .min(1, "At least one seat must be selected")
    .max(10, "At most 10 seats can be selected at a time")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate seat IDs are not allowed",
    }),
});

export const HoldSeatSchema = {
  body: HoldSeatBodySchema,
};
