import { injectable } from "inversify";
import { SeatHold } from "./entity/seat-hold.entity";

@injectable()
export default class SeatHoldResponse {
  buildHoldSeatResponse(seatHold: SeatHold) {
    return { data: seatHold };
  }

  buildGetSeatHoldResponse(seatHold: SeatHold) {
    return { data: seatHold };
  }
}
