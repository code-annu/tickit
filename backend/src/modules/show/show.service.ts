import TYPES from "@/core/di/inversify.types";
import { inject, injectable } from "inversify";
import ShowRepository from "./repository/show.repository";
import { Show } from "./entity/show.entity";
import { SeatHoldError, ShowNotFoundError } from "./error/errors";
import { ShowSeatInventory } from "./entity/show-seat-inventory.entity";
import { HoldShowSeatsDto } from "./dto/HoldShowSeatsDto";
import SeatHoldRepository from "./repository/seat-hold.repository";
import { addMinutes } from "date-fns";
import { prisma } from "@/core/prisma/prisma.client";
import { SeatHold } from "./entity/seat-hold.entity";

@injectable()
export default class ShowService {
  constructor(
    @inject(TYPES.ShowRepository) private readonly showRepo: ShowRepository,
    @inject(TYPES.SeatHoldRepository)
    private readonly seatHoldRepo: SeatHoldRepository,
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

  async holdShowSeats(
    userId: string,
    input: HoldShowSeatsDto,
  ): Promise<SeatHold> {
    const { showId, showSeatIds } = input;
    const show = await this.showRepo.findById(showId);
    if (!show) throw new ShowNotFoundError("Show not found!");

    const expiresAt = addMinutes(new Date(), 8);
    return prisma.$transaction(async (tx) => {
      showSeatIds.sort((a, b) => (a > b ? 1 : -1));
      const updatedCount = await this.seatHoldRepo.lockAndHoldSeats(tx, {
        showId,
        showSeatIds,
      });
      if (updatedCount !== showSeatIds.length) {
        throw new SeatHoldError("One or more seats could not be hold");
      }
      const seatHold = await this.seatHoldRepo.createHold(tx, {
        userId,
        showId,
        expiresAt,
      });
      await this.seatHoldRepo.createHoldItems(tx, {
        holdId: seatHold.id,
        showSeatIds,
      });

      return seatHold;
    });
  }
}
