import { describe } from "vitest";
import TheaterService from "../service/theater.service";
import { Theater } from "../entity/theater.entity";
import NotFoundError from "@/shared/error/types/NotFoundError";

const theaterRepo = {
  findById: vi.fn(),
};

const theaterService = new TheaterService(theaterRepo as any);

const theater: Theater = {
  id: "theater-1",
  name: "PVR Cinemas",
  city: "Mumbai",
  address: "123 Main Street, Andheri West",
  avatarUrl: "https://example.com/pvr.jpg",
  rating: 4.5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Get theater by id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should return theater", async () => {
    theaterRepo.findById.mockResolvedValue(theater);
    const result = await theaterService.getTheaterById("theater-1");

    expect(result).toEqual(theater);
    expect(theaterRepo.findById).toHaveBeenCalledWith("theater-1");
  });

  it("Should throw error for theater not found", async () => {
    theaterRepo.findById.mockResolvedValue(null);
    await expect(theaterService.getTheaterById("theater-1")).rejects.toThrow(
      NotFoundError,
    );
    expect(theaterRepo.findById).toHaveBeenCalledWith("theater-1");
  });
});
