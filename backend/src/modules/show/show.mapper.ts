import {
  Show as PrismShow,
  Movie as PrismaMovie,
  Theater as PrismaTheater,
  ShowSeat as PrismShowSeat,
  Seat as PrismaSeat,
} from "@/generated/prisma/client";
import { injectable } from "inversify";
import { Show } from "./entity/show.entity";
import { ShowSeatInventory } from "./entity/show-seat-inventory.entity";

type ShowWithRelations = PrismShow & {
  movie: PrismaMovie;
  theater: PrismaTheater;
};

type ShowSeatWithRelations = PrismShowSeat & {
  seat: PrismaSeat;
};

@injectable()
export default class ShowMapper {
  toShowEntity(show: ShowWithRelations): Show {
    const { movie, theater } = show;
    return {
      id: show.id,
      onDate: show.onDate.toLocaleDateString(),
      startTime: show.startTime.toLocaleTimeString(),
      endTime: show.endTime.toLocaleTimeString(),
      basePrice: show.basePrice.toNumber(),
      movie: { id: movie.id, title: movie.title },
      theater: { id: theater.id, address: theater.address },
    };
  }

  toShowSeatInventoryEntity(
    showId: string,
    showSeats: ShowSeatWithRelations[],
  ): ShowSeatInventory {
    return {
      showId,
      seats: showSeats.map((showSeat) => ({
        id: showSeat.id,
        rowName: showSeat.seat.rowName,
        seatNumber: showSeat.seat.seatNumber,
        status: showSeat.status,
        price: showSeat.price.toNumber(),
      })),
    };
  }
}
