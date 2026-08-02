import { Theater } from "./theater.entity";

export interface TheaterSeat {
  readonly id: string;
  readonly theater: Theater;
  readonly seatNumber: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
