export interface ShowSeatInventory {
  readonly showId: string;
  readonly seats: {
    readonly id: string;
    readonly rowName: string;
    readonly seatNumber: number;
    readonly status: ShowSeatStatus;
    readonly price: number;
  }[];
}

export type ShowSeatStatus = "AVAILABLE" | "HELD" | "BOOKED";
