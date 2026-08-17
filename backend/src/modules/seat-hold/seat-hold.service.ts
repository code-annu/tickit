import TYPES from "@/core/di/inversify.types";
import { inject, injectable } from "inversify";
import SeatHoldRepository from "./repository/seat-hold.repository";
import { SeatHold } from "./entity/seat-hold.entity";
import { SeatHoldError, SeatHoldNotFoundError } from "./error/errors";
import { HoldSeatDto } from "./dto/HoldSeatDto";
import { addMinutes } from "date-fns";
import { prisma } from "@/core/prisma/prisma.client";

@injectable()
export default class SeatHoldService {
  constructor(
    @inject(TYPES.SeatHoldRepository)
    private readonly seatHoldRepo: SeatHoldRepository,
  ) {}

  async holdSeat(userId: string, input: HoldSeatDto): Promise<SeatHold> {
    const { showId, showSeatIds } = input;

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

  async getSeatHoldById(id: string): Promise<SeatHold> {
    const seatHold = await this.seatHoldRepo.findById(id);
    if (!seatHold) throw new SeatHoldNotFoundError("Seat hold not found!");
    return seatHold;
  }
}
