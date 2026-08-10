import {
  Show as PrismaShow,
  Movie as PrismaMovie,
  Theater as PrismaTheater,
  ShowSeat as PrismaShowSeat,
  TheaterSeat as PrismaTheaterSeat,
} from "@/generated/prisma";
import { injectable } from "inversify";
import { Show } from "./entity/show.entity";
import { ShowSeatInventory } from "./entity/show-seat-inventory.entity";

type ShowWithMovieAndTheater = PrismaShow & {
  movie: PrismaMovie;
  theater: PrismaTheater;
};

type ShowWithSeats = PrismaShow & {
  showSeats: (PrismaShowSeat & { seat: PrismaTheaterSeat })[];
};

@injectable()
export default class ShowMapper {
  toShowEntity(show: ShowWithMovieAndTheater): Show {
    const { movie, theater } = show;
    return {
      id: show.id,
      movie: { id: movie.id, title: movie.title, posterUrl: movie.posterUrl },
      theater: { id: theater.id, name: theater.name, address: theater.address },
      onDate: show.onDate.toDateString(),
      startTime: show.startTime.toString(),
      endTime: show.endTime.toString(),
      duration: show.duration,
      onwardAmount: show.onwardAmount.toNumber(),
    };
  }

  toShowSeatInventoryEntity(
    showWithSeats: ShowWithSeats,
    stats: {
      totalSeats: number;
      availableSeats: number;
      bookedSeats: number;
      heldSeats: number;
    },
  ): ShowSeatInventory {
    const { showSeats } = showWithSeats;

    return {
      showId: showWithSeats.id,
      seats: showSeats.map((seat) => ({
        id: seat.id,
        rowName: seat.seat.rowName,
        seatNumber: seat.seat.seatNumber,
        status: seat.status,
        price: seat.price.toNumber(),
      })),
      totalSeats: stats.totalSeats,
      availableSeats: stats.availableSeats,
      bookedSeats: stats.bookedSeats,
      heldSeats: stats.heldSeats,
    };
  }
}
