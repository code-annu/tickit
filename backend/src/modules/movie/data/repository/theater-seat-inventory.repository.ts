import { inject, injectable } from "inversify";
import TYPES from "@/di/inversify.types";
import TheaterSeatInventoryMapper from "../mapper/theater-seat-inventory.mapper";
import { prisma } from "@/config/prisma.client";
import { TheaterSeatInventory } from "../../domain/entity/theater-seat-inventory.entity";

@injectable()
export default class TheaterSeatInventoryRepository {
  constructor(
    @inject(TYPES.TheaterSeatInventoryMapper)
    private readonly mapper: TheaterSeatInventoryMapper,
    private readonly db = prisma,
  ) {}

  async findAllByStreamingId(
    streamingId: string,
  ): Promise<TheaterSeatInventory[]> {
    const inventory = await this.db.theaterSeatInventory.findMany({
      where: { streamingId },
      include: { seat: true },
    });
    return inventory.map((i) => this.mapper.toEntity(i));
  }
}
