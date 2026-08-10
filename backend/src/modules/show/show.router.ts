import { inject, injectable } from "inversify";
import { Router } from "express";
import TYPES from "@/core/di/inversify.types";
import ShowController from "./show.controller";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import authenticateUser from "@/shared/middleware/authenticate.middleware";
import { GetShowDetailsSchema } from "./schema/GetShowDetailsSchema";
import { GetShowSeatInventorySchema } from "./schema/GetShowSeatInventorySchema";

@injectable()
export default class ShowRouter {
  public readonly router: Router;

  constructor(
    @inject(TYPES.ShowController)
    private readonly showController: ShowController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/:id",
      validateRequest(GetShowDetailsSchema),
      this.showController.getShowDetails,
    );
    this.router.get(
      "/:id/seats",
      authenticateUser,
      validateRequest(GetShowSeatInventorySchema),
      this.showController.getShowSeatInventory,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
