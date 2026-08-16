import TYPES from "@/core/di/inversify.types";
import { prisma } from "@/core/prisma/prisma.client";
import { inject, injectable } from "inversify";
import TheaterMapper from "../theater.mapper";
import { Theater } from "../entity/theater.entity";
import { TheaterShows } from "../entity/theater-shows.entity";

@injectable()
export default class TheaterRepository {
  private readonly db = prisma;

  constructor(
    @inject(TYPES.TheaterMapper) private readonly mapper: TheaterMapper,
  ) {}

  async findById(id: string): Promise<Theater | null> {
    const theater = await this.db.theater.findUnique({
      where: { id },
    });
    return theater ? this.mapper.toTheaterEntity(theater) : null;
  }

  async findShowByTheaterId(
    theaterId: string,
    options: { date: string },
  ): Promise<TheaterShows> {
    const targetDate = new Date(options.date);
    const movies = await this.db.movie.findMany({
      where: {
        shows: { some: { theaterId, onDate: targetDate } },
      },
      include: {
        shows: {
          where: { theaterId, onDate: targetDate },
          orderBy: { startTime: "asc" },
        },
      },
    });
    return this.mapper.toTheaterShowsEntity(theaterId, options.date, movies);
  }
}
