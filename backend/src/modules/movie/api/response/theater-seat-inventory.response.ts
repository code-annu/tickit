import { TheaterSeatInventory } from "../../domain/entity/theater-seat-inventory.entity";

export function buildStreamingTheaterSeatInventoryResponse(
  data: TheaterSeatInventory[],
  message: string,
) {
  return {
    success: true,
    message,
    data: {
      seatInventory: data,
      count: data.length,
    },
  };
}
