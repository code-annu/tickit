import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import TheaterSeatInventoryRepository from "../../data/repository/theater-seat-inventory.repository";
import { TheaterSeatInventory } from "../entity/theater-seat-inventory.entity";

@injectable()
export default class MovieBookingService {
  constructor(
    @inject(TYPES.TheaterSeatInventoryRepository)
    private readonly theaterSeatInventoryRepo: TheaterSeatInventoryRepository,
  ) {}

  async getStreamingTheaterSeatInventory(
    streamingTheaterId: string,
  ): Promise<TheaterSeatInventory[]> {
    return this.theaterSeatInventoryRepo.findAllByStreamingId(
      streamingTheaterId,
    );
  }
}
