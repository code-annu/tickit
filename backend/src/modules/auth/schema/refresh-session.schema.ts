import z from "zod";

export const RefreshSessionSchema = {
  body: z.object({
    token: z
      .string("Refresh token is required")
      .trim()
      .min(1, "Refresh token cannot be empty")
      .optional()
      .nullable(),
  }),
};
