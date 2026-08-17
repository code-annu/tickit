import { prisma, Tx } from "@/core/prisma/prisma.client";
import { inject, injectable } from "inversify";
import { SeatHold } from "../entity/seat-hold.entity";
import TYPES from "@/core/di/inversify.types";
import SeatHoldMapper from "../seat-hold.mapper";

@injectable()
export default class SeatHoldRepository {
  private readonly db = prisma;

  constructor(@inject(TYPES.SeatHoldMapper) private readonly mapper: SeatHoldMapper) {}

  async findById(id: string): Promise<SeatHold | null> {
    const seatHold = await this.db.seatHold.findUnique({
      where: { id },
    });
    return seatHold ? this.mapper.toSeatHoldEntity(seatHold) : null;
  }

  /**
   * Atomically marks seats as HELD if they are currently AVAILABLE,
   * or if they were HELD but the hold has expired.
   * Returns the number of seats that were successfully locked.
   */
  async lockAndHoldSeats(
    tx: Tx,
    params: {
      showId: string;
      showSeatIds: string[];
    },
  ) {
    const { showId, showSeatIds } = params;

    const result = await tx.showSeat.updateMany({
      where: {
        showId,
        id: { in: showSeatIds },

        OR: [
          { status: "AVAILABLE" },
          {
            status: "HELD",
            // A seat is re-claimable if every active hold referencing it has expired
            seatHoldItems: {
              every: { hold: { expiresAt: { lte: new Date() } } },
            },
          },
        ],
      },
      data: { status: "HELD" },
    });

    return result.count;
  }

  /**
   * Fetch ShowSeat rows (with their parent Seat info) by IDs.
   */
  async getShowSeats(tx: Tx, showSeatIds: string[]) {
    return tx.showSeat.findMany({
      where: { id: { in: showSeatIds } },
      include: { seat: true },
    });
  }

  /**
   * Create the parent SeatHold record for a user + show.
   */
  async createHold(
    tx: Tx,
    data: {
      userId: string;
      showId: string;
      expiresAt: Date;
    },
  ): Promise<SeatHold> {
    const seatHold = await tx.seatHold.create({
      data: {
        userId: data.userId,
        showId: data.showId,
        expiresAt: data.expiresAt,
        status: "ACTIVE",
      },
    });
    return this.mapper.toSeatHoldEntity(seatHold);
  }

  /**
   * Create the child SeatHoldItem rows linking a hold to its seats.
   */
  async createHoldItems(
    tx: Tx,
    data: {
      holdId: string;
      showSeatIds: string[];
    },
  ) {
    return tx.seatHoldItem.createMany({
      data: data.showSeatIds.map((showSeatId) => ({
        holdId: data.holdId,
        showSeatId,
      })),
    });
  }
}
