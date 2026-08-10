import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import TYPES from "@/core/di/inversify.types";
import ShowService from "./show.service";
import ShowResponse from "./show.response";
import catchAsync from "@/core/error/async.catch";

@injectable()
export default class ShowController {
  constructor(
    @inject(TYPES.ShowService)
    private readonly showService: ShowService,
    @inject(TYPES.ShowResponse)
    private readonly showResponse: ShowResponse,
  ) {}

  getShowDetails = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const show = await this.showService.getShowDetails(id);
    res
      .status(200)
      .json(
        this.showResponse.buildShowResponse(
          show,
          "Show details fetched successfully",
        ),
      );
  });

  getShowSeatInventory = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const inventory = await this.showService.getShowSeatInventory(id);
    res
      .status(200)
      .json(
        this.showResponse.buildShowSeatInventoryResponse(
          inventory,
          "Show seat inventory fetched successfully",
        ),
      );
  });
}
