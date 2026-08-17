import { SeatHold as PrismaSeatHold } from "@/generated/prisma/client";
import { injectable } from "inversify";
import { SeatHold, SeatHoldStatus } from "./entity/seat-hold.entity";

@injectable()
export default class SeatHoldMapper {
  toSeatHoldEntity(seatHold: PrismaSeatHold): SeatHold {
    return {
      id: seatHold.id,
      showId: seatHold.showId,
      userId: seatHold.userId,
      status: seatHold.status as SeatHoldStatus,
      expiresAt: seatHold.expiresAt,
    };
  }
}
