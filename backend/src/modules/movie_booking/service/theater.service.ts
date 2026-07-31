import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import TheaterRepository from "../repository/theater.repository";
import { Theater } from "../entity/theater.entity";
import NotFoundError from "@/shared/error/types/NotFoundError";
import TheaterErrorCode from "../errors/TheaterErrorCode";

@injectable()
export default class TheaterService {
  constructor(
    @inject(TYPES.TheaterRepository)
    private readonly theaterRepo: TheaterRepository,
  ) {}

  async getTheaterById(id: string): Promise<Theater> {
    const theater = await this.theaterRepo.findById(id);
    if (!theater) {
      throw new NotFoundError(
        "Theater not found",
        TheaterErrorCode.THEATER_NOT_FOUND,
      );
    }
    return theater;
  }
}
