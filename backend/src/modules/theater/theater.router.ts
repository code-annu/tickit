import { Router } from "express";
import { inject, injectable } from "inversify";
import TYPES from "@/core/di/inversify.types";
import TheaterController from "./theater.controller";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { GetTheaterDetailsSchema } from "./schema/GetTheaterDetailsSchema";
import { GetTheaterShowsSchema } from "./schema/GetTheaterShowsSchema";

@injectable()
export default class TheaterRouter {
  public readonly router: Router;

  constructor(
    @inject(TYPES.TheaterController)
    private readonly controller: TheaterController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get(
      "/:id",
      validateRequest(GetTheaterDetailsSchema),
      this.controller.getTheaterDetails,
    );

    this.router.get(
      "/:id/shows",
      validateRequest(GetTheaterShowsSchema),
      this.controller.getTheaterShows,
    );
  }
}
