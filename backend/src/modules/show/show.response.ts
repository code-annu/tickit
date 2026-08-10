import { injectable } from "inversify";
import { Show } from "./entity/show.entity";
import { ShowSeatInventory } from "./entity/show-seat-inventory.entity";

@injectable()
export default class ShowResponse {
  buildShowResponse(
    data: Show,
    message: string = "Show details fetched successfully",
  ) {
    return { success: true, message, data };
  }

  buildShowSeatInventoryResponse(
    data: ShowSeatInventory,
    message: string = "Show seat inventory fetched successfully",
  ) {
    return { success: true, message, data };
  }
}
