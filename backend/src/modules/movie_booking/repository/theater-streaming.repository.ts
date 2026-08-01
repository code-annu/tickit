import { prisma } from "@/config/prisma.client";
import { inject, injectable } from "inversify";
import { TheaterStreaming } from "../entity/theater-streaming.entity";
import TYPES from "@/di/inversify.types";
import TheaterStreamingMapper from "../mapper/theater-streaming.mapper";

@injectable()
export default class TheaterStreamingRepository {
  constructor(
    @inject(TYPES.TheaterStreamingMapper)
    private readonly mapper: TheaterStreamingMapper,
    private readonly db = prisma,
  ) {}

  async findStreamingOf(
    movieId: string,
    options: { city: string; date: Date },
  ): Promise<TheaterStreaming[]> {
    const theaterStreamings = await this.db.theaterStreaming.findMany({
      where: {
        movieId,
        theater: { city: options.city },
        onDate: options.date,
      },
      include: { theater: true },
      orderBy: { startTime: "asc" },
    });

    return theaterStreamings.map(this.mapper.toEntity);
  }
}
