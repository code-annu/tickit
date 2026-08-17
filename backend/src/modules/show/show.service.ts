import TYPES from "@/core/di/inversify.types";
import { inject, injectable } from "inversify";
import ShowRepository from "./repository/show.repository";
import { Show } from "./entity/show.entity";
import { ShowNotFoundError } from "./error/errors";
import { ShowSeatInventory } from "./entity/show-seat-inventory.entity";

@injectable()
export default class ShowService {
  constructor(
    @inject(TYPES.ShowRepository) private readonly showRepo: ShowRepository,
  ) {}

  async getShowDetails(id: string): Promise<Show> {
    const show = await this.showRepo.findById(id);
    if (!show) throw new ShowNotFoundError("Show not found!");
    return show;
  }

  async getShowSeatMap(showId: string): Promise<ShowSeatInventory> {
    const show = await this.showRepo.findById(showId);
    if (!show) throw new ShowNotFoundError("Show not found!");
    return this.showRepo.findSeatInventoryByShowId(showId);
  }
}
