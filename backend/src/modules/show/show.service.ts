import TYPES from "@/core/di/inversify.types";
import { inject, injectable } from "inversify";
import ShowRepository from "./repository/show.repository";
import { Show } from "./entity/show.entity";
import NotFoundError from "@/core/error/types/NotFoundError";
import ShowErrorCode from "./ShowErrorCode";
import { ShowSeatInventory } from "./entity/show-seat-inventory.entity";

@injectable()
export default class ShowService {
  constructor(
    @inject(TYPES.ShowRepository) private readonly showRepo: ShowRepository,
  ) {}

  async getShowDetails(id: string): Promise<Show> {
    const show = await this.showRepo.findById(id);
    if (!show) {
      throw new NotFoundError("Show not found", ShowErrorCode.SHOW_NOT_FOUND);
    }
    return show;
  }

  async getShowSeatInventory(showId: string): Promise<ShowSeatInventory> {
    const inventory = await this.showRepo.findSeatMap(showId);
    if (!inventory) {
      throw new NotFoundError("Show not found", ShowErrorCode.SHOW_NOT_FOUND);
    }
    return inventory;
  }
}
