import { prisma } from "@/core/prisma/prisma.client";
import { inject, injectable } from "inversify";
import { Show } from "../entity/show.entity";
import TYPES from "@/core/di/inversify.types";
import ShowMapper from "../show.mapper";
import {
  SeatStatus,
  ShowSeatInventory,
} from "../entity/show-seat-inventory.entity";

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

  async findSeatMap(id: string): Promise<ShowSeatInventory | null> {
    const [showWithSeats, seatCounts] = await Promise.all([
      this.db.show.findUnique({
        where: { id },
        include: { showSeats: { include: { seat: true } } },
      }),
      this.db.showSeat.groupBy({
        by: ["status"],
        where: { showId: id },
        _count: { id: true },
      }),
    ]);

    if (!showWithSeats) return null;

    const stats = {
      totalSeats: 0,
      availableSeats: 0,
      bookedSeats: 0,
      heldSeats: 0,
    };

    for (const group of seatCounts) {
      const count = group._count.id;
      stats.totalSeats += count;
      if (group.status === "AVAILABLE") stats.availableSeats = count;
      else if (group.status === "BOOKED") stats.bookedSeats = count;
      else if (group.status === "HELD") stats.heldSeats = count;
    }

    return this.mapper.toShowSeatInventoryEntity(showWithSeats, stats);
  }

  async updateSeatsStatus(
    showId: string,
    seatIds: string[],
    status: SeatStatus,
  ): Promise<number> {
    const updatedSeats = await this.db.showSeat.updateMany({
      where: { showId: showId, id: { in: seatIds } },
      data: { status },
    });

    return updatedSeats.count;
  }
}
