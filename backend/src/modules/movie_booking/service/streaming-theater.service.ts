import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import StreamingTheaterRepository from "../repository/streaming-theater.repository";

@injectable()
export default class StreamingTheaterService {
  constructor(
    @inject(TYPES.StreamingTheaterRepository)
    private readonly streamingTheaterRepo: StreamingTheaterRepository,
  ) {}

  async getTheatersForMovie(
    movieId: string,
    options: { city: string; date: Date },
  ) {
    return this.streamingTheaterRepo.listTheatersForMovie(movieId, options);
  }
}
