export interface TheaterSeatInventory {
  readonly id: string;
  readonly seat: {
    readonly id: string;
    readonly seatNumber: string;
  };
  readonly price: number;
  readonly status: SeatStatus;
}

// export enum SeatStatus {
//   BOOKED = "BOOKED",
//   HELD = "HELD",
//   AVAILABLE = "AVAILABLE",
// }

type SeatStatus = "BOOKED" | "HELD" | "AVAILABLE";
