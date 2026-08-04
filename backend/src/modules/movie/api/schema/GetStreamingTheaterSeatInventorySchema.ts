import z from "zod";

export const GetStreamingTheaterSeatInventorySchema = {
  params: z.object({
    streamingId: z.uuid("Streaming id should be a valid uuid").trim(),
  }),
};
