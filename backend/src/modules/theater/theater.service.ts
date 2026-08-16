import TYPES from "@/core/di/inversify.types";
import { inject, injectable } from "inversify";
import TheaterRepository from "./repository/theater.repository";
import { Theater } from "./entity/theater.entity";
import { TheaterShows } from "./entity/theater-shows.entity";
import { TheaterNotFoundError } from "./error/errors";
import { GetTheaterShowsDto } from "./dto/GetTheaterShowsDto";

@injectable()
export default class TheaterService {
  constructor(
    @inject(TYPES.TheaterRepository)
    private readonly theaterRepo: TheaterRepository,
  ) {}

  async getTheaterDetails(id: string): Promise<Theater> {
    const theater = await this.theaterRepo.findById(id);
    if (!theater) throw new TheaterNotFoundError("Theater not found");

    return theater;
  }

  async getTheaterShows(input: GetTheaterShowsDto): Promise<TheaterShows> {
    const { theaterId, options } = input;

    const theater = await this.theaterRepo.findById(theaterId);
    if (!theater) throw new TheaterNotFoundError("Theater not found");

    return this.theaterRepo.findShowByTheaterId(theaterId, options);
  }
}
