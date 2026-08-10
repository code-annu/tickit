import { inject, injectable } from "inversify";
import { prisma } from "@/core/prisma/prisma.client";
import TYPES from "@/core/di/inversify.types";
import TheaterShowMapper from "../mapper/theater-show.mapper";
import { TheaterShow } from "../entity/theater-show.entity";

@injectable()
export default class TheaterShowRepository {
  private readonly db = prisma;

  constructor(
    @inject(TYPES.TheaterShowMapper)
    private readonly mapper: TheaterShowMapper,
  ) {}

  async findByTheater(
    theaterId: string,
    options: { date: Date },
  ): Promise<TheaterShow[]> {
    const shows = await this.db.show.findMany({
      where: { theaterId, onDate: options.date },
      include: { movie: true },
      orderBy: { startTime: "asc" },
    });

    return this.mapper.toEntities(shows);
  }
}
