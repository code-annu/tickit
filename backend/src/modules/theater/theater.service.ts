import { inject, injectable } from "inversify";
import TYPES from "@/core/di/inversify.types";
import TheaterRepository from "./repository/theater.repository";
import TheaterShowRepository from "./repository/theater-show.repository";
import NotFoundError from "@/core/error/types/NotFoundError";
import TheaterErrorCode from "./TheaterErrorCode";
import { Theater } from "./entity/theater.entity";
import { TheaterShow } from "./entity/theater-show.entity";
import { GetTheaterShowsDto } from "./dto/GetTheaterShowsDto";

@injectable()
export default class TheaterService {
  constructor(
    @inject(TYPES.TheaterRepository)
    private readonly theaterRepository: TheaterRepository,
    @inject(TYPES.TheaterShowRepository)
    private readonly theaterShowRepository: TheaterShowRepository,
  ) {}

  async getCityTheaters(city: string): Promise<Theater[]> {
    return this.theaterRepository.findByCity(city);
  }

  async getTheaterDetails(id: string): Promise<Theater> {
    const theater = await this.theaterRepository.findById(id);
    if (!theater) {
      throw new NotFoundError(
        "Theater not found",
        TheaterErrorCode.THEATER_NOT_FOUND,
      );
    }
    return theater;
  }

  async getTheaterShows(input: GetTheaterShowsDto): Promise<TheaterShow[]> {
    return this.theaterShowRepository.findByTheater(
      input.theaterId,
      input.options,
    );
  }
}
