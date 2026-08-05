import {
  MovieBookingSeat as PrismaMovieBookingSeat,
  TheaterSeatInventory as PrismaTheaterSeatInventory,
  TheaterSeat as PrismaTheaterSeat,
} from "@/generated/prisma";
import { injectable } from "inversify";
import { MovieBookingSeat } from "../entity/movie-booking-seat.entity";

export type MovieBookingSeatWithInventory = PrismaMovieBookingSeat & {
  inventory: PrismaTheaterSeatInventory & {
    seat: PrismaTheaterSeat;
  };
};

@injectable()
export default class MovieBookingSeatMapper {
  toEntity(data: MovieBookingSeatWithInventory): MovieBookingSeat {
    return {
      id: data.id,
      inventory: {
        id: data.inventory.id,
        price: data.inventory.price.toNumber(),
        seat: {
          id: data.inventory.seat.id,
          seatNumber: data.inventory.seat.seatNumber,
        },
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
