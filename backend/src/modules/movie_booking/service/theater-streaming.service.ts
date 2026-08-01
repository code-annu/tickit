import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import TheaterStreamingRepository from "../repository/theater-streaming.repository";

@injectable()
export default class TheaterStreamingService {
  constructor(
    @inject(TYPES.TheaterStreamingRepository)
    private readonly theaterStreamingRepo: TheaterStreamingRepository,
  ) {}

  async getStreamingTheatersForMovieInCity(
    movieId: string,
    options: { city: string; date: Date },
  ) {
    return this.theaterStreamingRepo.findStreamingOf(movieId, options);
  }
}
