import {
  MovieBooking as PrismaMovieBooking,
  StreamingTheater as PrismaStreamingTheater,
  Theater as PrismaTheater,
  Movie as PrismaMovie,
  PaymentTransaction as PrismaPaymentTransaction,
} from "@/generated/prisma";
import { inject, injectable } from "inversify";
import { MovieBooking } from "../entity/movie-booking.entity";
import TYPES from "@/di/inversify.types";
import PaymentTransactionMapper from "./payment-transaction.mapper";
import MovieBookingSeatMapper, {
  MovieBookingSeatWithInventory,
} from "./movie-booking-seat.mapper";

type MovieBookingWithRelations = PrismaMovieBooking & {
  streaming: PrismaStreamingTheater & {
    movie: PrismaMovie;
    theater: PrismaTheater;
  };
  paymentTransaction: PrismaPaymentTransaction;
  movieBookingSeats: MovieBookingSeatWithInventory[];
};

@injectable()
export default class MovieBookingMapper {
  constructor(
    @inject(TYPES.PaymentTransactionMapper)
    private readonly paymentTransactionMapper: PaymentTransactionMapper,
    @inject(TYPES.MovieBookingSeatMapper)
    private readonly seatMapper: MovieBookingSeatMapper,
  ) {}

  toEntity(data: MovieBookingWithRelations): MovieBooking {
    return {
      id: data.id,
      userId: data.userId,
      status: data.status,
      streaming: {
        id: data.streaming.id,
        movie: {
          id: data.streaming.movie.id,
          title: data.streaming.movie.title,
          posterUrl: data.streaming.movie.posterUrl,
          language: data.streaming.movie.language,
        },
        theater: {
          id: data.streaming.theater.id,
          name: data.streaming.theater.name,
          city: data.streaming.theater.city,
          address: data.streaming.theater.address,
        },
        onDate: data.streaming.onDate,
        startTime: data.streaming.startTime,
      },
      transaction: this.paymentTransactionMapper.toEntity(
        data.paymentTransaction,
      ),
      seats: data.movieBookingSeats.map((s) => this.seatMapper.toEntity(s)),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
