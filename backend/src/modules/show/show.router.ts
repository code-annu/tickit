import { Router } from "express";
import { inject, injectable } from "inversify";
import TYPES from "@/core/di/inversify.types";
import ShowController from "./show.controller";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { GetShowDetailsSchema } from "./schema/GetShowDetailsSchema";
import { GetShowSeatMapSchema } from "./schema/GetShowSeatMapSchema";

@injectable()
export default class ShowRouter {
  public readonly router: Router;

  constructor(
    @inject(TYPES.ShowController)
    private readonly controller: ShowController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get(
      "/:id",
      validateRequest(GetShowDetailsSchema),
      this.controller.getShowDetails,
    );

    this.router.get(
      "/:id/seat-map",
      validateRequest(GetShowSeatMapSchema),
      this.controller.getShowSeatMap,
    );
  }
}
