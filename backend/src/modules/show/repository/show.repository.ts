import TYPES from "@/core/di/inversify.types";
import { prisma } from "@/core/prisma/prisma.client";
import { injectable, inject } from "inversify";
import ShowMapper from "../show.mapper";
import { Show } from "../entity/show.entity";
import { ShowSeatInventory } from "../entity/show-seat-inventory.entity";

@injectable()
export default class ShowRepository {
  private readonly db = prisma;

  constructor(@inject(TYPES.ShowMapper) private readonly mapper: ShowMapper) {}

  async findById(id: string): Promise<Show | null> {
    const show = await this.db.show.findUnique({
      where: { id },
      include: { movie: true, theater: true },
    });

    return show ? this.mapper.toShowEntity(show) : null;
  }

  async findSeatInventoryByShowId(showId: string): Promise<ShowSeatInventory> {
    const showSeats = await this.db.showSeat.findMany({
      where: { showId },
      include: { seat: true },
    });
    return this.mapper.toShowSeatInventoryEntity(showId, showSeats);
  }
}
