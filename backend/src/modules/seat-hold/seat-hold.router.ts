import { Router } from "express";
import { inject, injectable } from "inversify";
import TYPES from "@/core/di/inversify.types";
import SeatHoldController from "./seat-hold.controller";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { HoldSeatSchema } from "./schema/HoldSeatSchema";
import { GetSeatHoldSchema } from "./schema/GetSeatHoldSchema";
import authenticateUser from "@/shared/middleware/authenticate.middleware";

@injectable()
export default class SeatHoldRouter {
  public readonly router: Router;

  constructor(
    @inject(TYPES.SeatHoldController)
    private readonly controller: SeatHoldController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/",
      authenticateUser,
      validateRequest(HoldSeatSchema),
      this.controller.holdSeat,
    );

    this.router.get(
      "/:id",
      authenticateUser,
      validateRequest(GetSeatHoldSchema),
      this.controller.getSeatHoldById,
    );
  }
}
