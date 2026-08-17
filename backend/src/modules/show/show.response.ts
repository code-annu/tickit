import { injectable } from "inversify";
import { Show } from "./entity/show.entity";
import { ShowSeatInventory } from "./entity/show-seat-inventory.entity";

@injectable()
export default class ShowResponse {
  buildShowResponse(show: Show) {
    return { data: show };
  }

  buildShowSeatMapResponse(inventory: ShowSeatInventory) {
    return { data: inventory };
  }
}
