import { PaymentTransaction } from "./payment-transaction.entity";
import { MovieBookingSeat } from "./movie-booking-seat.entity";

export interface MovieBooking {
  readonly id: string;
  readonly userId: string;
  readonly status: MovieBookingStatus;
  readonly streaming: {
    id: string;
    movie: {
      id: string;
      title: string;
      posterUrl: string;
      language: string;
    };
    theater: {
      id: string;
      name: string;
      city: string;
      address: string;
    };
    onDate: Date;
    startTime: Date;
  };
  readonly transaction: PaymentTransaction;
  readonly seats: MovieBookingSeat[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type MovieBookingStatus = "FAILED" | "SUCCESS";
