export interface ShowSeat {
  id: string;
  rowName: string;
  seatNumber: number;
  status: SeatStatus;
  price: number;
}

export interface ShowSeatInventory {
  showId: string;
  seats: ShowSeat[];
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  heldSeats: number;
}

export type SeatStatus = "AVAILABLE" | "BOOKED" | "HELD";
