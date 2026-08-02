import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import TheaterStreamingRepository from "../repository/theater-streaming.repository";

@injectable()
export default class TheaterStreamingService {
  constructor(
    @inject(TYPES.TheaterStreamingRepository)
    private readonly theaterStreamingRepo: TheaterStreamingRepository,
  ) {}

  async getTheatersForMovieInCity(
    movieId: string,
    options: { city: string; date: Date },
  ) {
    return this.theaterStreamingRepo.findStreamingFor(movieId, options);
  }
}
