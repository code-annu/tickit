import { prisma } from "@/config/prisma.client";
import { inject, injectable } from "inversify";
import { StreamingTheater } from "../../domain/entity/streaming-theater.entity";
import TYPES from "@/di/inversify.types";
import StreamingTheaterMapper from "../mapper/streaming-theater.mapper";

@injectable()
export default class StreamingTheaterRepository {
  constructor(
    @inject(TYPES.StreamingTheaterMapper)
    private readonly mapper: StreamingTheaterMapper,
    private readonly db = prisma,
  ) {}

  async listTheatersForMovie(
    movieId: string,
    options: { city: string; date: Date },
  ): Promise<StreamingTheater[]> {
    const streamingTheaters = await this.db.streamingTheater.findMany({
      where: {
        movieId,
        theater: { city: options.city },
        onDate: options.date,
      },
      include: { theater: true },
      orderBy: { startTime: "asc" },
    });

    return streamingTheaters.map(this.mapper.toEntity);
  }
}
