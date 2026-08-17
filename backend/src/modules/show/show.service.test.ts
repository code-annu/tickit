import { describe, expect, it, vi, type Mock } from "vitest";
import ShowService from "./show.service";
import type ShowRepository from "./repository/show.repository";
import type { Show } from "./entity/show.entity";
import type { ShowSeatInventory } from "./entity/show-seat-inventory.entity";
import { ShowNotFoundError } from "./error/errors";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const mockShow: Show = {
  id: "show-1",
  onDate: "2026-08-15",
  startTime: "10:00",
  endTime: "12:30",
  basePrice: 250,
  movie: { id: "movie-1", title: "Inception" },
  theater: { id: "theater-1", address: "123 Main Street" },
};

const mockSeatInventory: ShowSeatInventory = {
  showId: "show-1",
  seats: [
    {
      id: "show-seat-1",
      rowName: "A",
      seatNumber: 1,
      status: "AVAILABLE",
      price: 250,
    },
    {
      id: "show-seat-2",
      rowName: "A",
      seatNumber: 2,
      status: "HELD",
      price: 250,
    },
    {
      id: "show-seat-3",
      rowName: "B",
      seatNumber: 1,
      status: "BOOKED",
      price: 300,
    },
  ],
};

// ---------------------------------------------------------------------------
// Factory for mocked dependencies
// ---------------------------------------------------------------------------
function createMocks() {
  const showRepo: Record<string, Mock> = {
    findById: vi.fn(),
    findSeatInventoryByShowId: vi.fn(),
  };

  const showService = new (ShowService as any)(showRepo);

  return {
    showService: showService as ShowService,
    showRepo: showRepo as unknown as ShowRepository,
  };
}

// ===========================================================================
// GET SHOW DETAILS
// ===========================================================================
describe("getShowDetails", () => {
  it("should return the show when it exists", async () => {
    const { showService, showRepo } = createMocks();
    (showRepo.findById as Mock).mockResolvedValue(mockShow);

    const result = await showService.getShowDetails("show-1");

    expect(showRepo.findById).toHaveBeenCalledWith("show-1");
    expect(result).toEqual(mockShow);
  });

  it("should throw ShowNotFoundError when show does not exist", async () => {
    const { showService, showRepo } = createMocks();
    (showRepo.findById as Mock).mockResolvedValue(null);

    await expect(showService.getShowDetails("nonexistent-id")).rejects.toThrow(
      ShowNotFoundError,
    );

    expect(showRepo.findById).toHaveBeenCalledWith("nonexistent-id");
  });

  it("should propagate errors from showRepo.findById", async () => {
    const { showService, showRepo } = createMocks();
    (showRepo.findById as Mock).mockRejectedValue(new Error("DB error"));

    await expect(showService.getShowDetails("show-1")).rejects.toThrow(
      "DB error",
    );
  });
});

// ===========================================================================
// GET SHOW SEAT MAP
// ===========================================================================
describe("getShowSeatMap", () => {
  it("should return seat inventory when the show exists", async () => {
    const { showService, showRepo } = createMocks();
    (showRepo.findById as Mock).mockResolvedValue(mockShow);
    (showRepo.findSeatInventoryByShowId as Mock).mockResolvedValue(
      mockSeatInventory,
    );

    const result = await showService.getShowSeatMap("show-1");

    expect(showRepo.findById).toHaveBeenCalledWith("show-1");
    expect(showRepo.findSeatInventoryByShowId).toHaveBeenCalledWith("show-1");
    expect(result).toEqual(mockSeatInventory);
  });

  it("should throw ShowNotFoundError when show does not exist", async () => {
    const { showService, showRepo } = createMocks();
    (showRepo.findById as Mock).mockResolvedValue(null);

    await expect(showService.getShowSeatMap("nonexistent-id")).rejects.toThrow(
      ShowNotFoundError,
    );

    expect(showRepo.findById).toHaveBeenCalledWith("nonexistent-id");
    expect(showRepo.findSeatInventoryByShowId).not.toHaveBeenCalled();
  });

  it("should return empty seats array when show has no seats", async () => {
    const { showService, showRepo } = createMocks();
    const emptySeatInventory: ShowSeatInventory = {
      showId: "show-1",
      seats: [],
    };
    (showRepo.findById as Mock).mockResolvedValue(mockShow);
    (showRepo.findSeatInventoryByShowId as Mock).mockResolvedValue(
      emptySeatInventory,
    );

    const result = await showService.getShowSeatMap("show-1");

    expect(result.seats).toEqual([]);
  });

  it("should propagate errors from showRepo.findSeatInventoryByShowId", async () => {
    const { showService, showRepo } = createMocks();
    (showRepo.findById as Mock).mockResolvedValue(mockShow);
    (showRepo.findSeatInventoryByShowId as Mock).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(showService.getShowSeatMap("show-1")).rejects.toThrow(
      "DB error",
    );
  });
});
