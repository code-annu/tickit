import {
  TheaterSeatInventory as PrismaTheaterSeatInventory,
  TheaterSeat as PrismaTheaterSeat,
} from "@/generated/prisma";
import { injectable } from "inversify";
import { TheaterSeatInventory } from "../../domain/entity/theater-seat-inventory.entity";

type TheaterSeatInventoryWithSeat = PrismaTheaterSeatInventory & {
  seat: PrismaTheaterSeat;
};

@injectable()
export default class TheaterSeatInventoryMapper {
  toEntity(seatInventory: TheaterSeatInventoryWithSeat): TheaterSeatInventory {
    const { seat } = seatInventory;
    return {
      id: seatInventory.id,
      seat: {
        id: seat.id,
        seatNumber: seat.seatNumber,
      },
      price: seatInventory.price.toNumber(),
      status: seatInventory.status,
    };
  }
}
