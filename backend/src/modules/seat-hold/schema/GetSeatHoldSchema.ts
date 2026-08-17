import { z } from "zod";

const GetSeatHoldParamSchema = z.object({
  id: z.uuid("Valid UUID is required"),
});

export const GetSeatHoldSchema = {
  params: GetSeatHoldParamSchema,
};
