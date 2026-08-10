import { inject, injectable } from "inversify";
import { Router } from "express";
import TYPES from "@/core/di/inversify.types";
import TheaterController from "./theater.controller";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { GetCityTheatersSchema } from "./schema/GetCityTheatersSchema";
import { GetTheaterDetailsSchema } from "./schema/GetTheaterDetailsSchema";
import { GetTheaterShowsSchema } from "./schema/GetTheaterShowsSchema";

@injectable()
export default class TheaterRouter {
  public readonly router: Router;

  constructor(
    @inject(TYPES.TheaterController)
    private readonly theaterController: TheaterController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      validateRequest(GetCityTheatersSchema),
      this.theaterController.getCityTheaters,
    );
    this.router.get(
      "/:id",
      validateRequest(GetTheaterDetailsSchema),
      this.theaterController.getTheaterDetails,
    );
    this.router.get(
      "/:id/shows",
      validateRequest(GetTheaterShowsSchema),
      this.theaterController.getTheaterShows,
    );
  }
}
