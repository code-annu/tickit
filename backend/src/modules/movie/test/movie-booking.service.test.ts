import { TheaterSeatInventory } from "../domain/entity/theater-seat-inventory.entity";
import MovieBookingService from "../domain/service/movie-booking.service";
import TheaterSeatInventoryRepository from "../data/repository/theater-seat-inventory.repository";

// ── Factory helper ──────────────────────────────────────────────────
function buildSeatInventory(
  overrides: Partial<TheaterSeatInventory> = {},
): TheaterSeatInventory {
  return {
    id: "inv-1",
    seat: { id: "seat-1", seatNumber: "A1" },
    price: 250,
    status: "AVAILABLE",
    ...overrides,
  };
}

// ── Test suite ──────────────────────────────────────────────────────
describe("MovieBookingService", () => {
  let service: MovieBookingService;
  let mockRepo: { findAllByStreamingId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockRepo = {
      findAllByStreamingId: vi.fn(),
    };

    // Instantiate the service with the mocked repository.
    // We bypass Inversify here — the constructor simply expects the repo instance.
    service = new MovieBookingService(
      mockRepo as unknown as TheaterSeatInventoryRepository,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getStreamingTheaterSeatInventory", () => {
    it("should call repository with the provided streamingTheaterId", async () => {
      const streamingId = "streaming-abc-123";
      mockRepo.findAllByStreamingId.mockResolvedValue([]);

      await service.getStreamingTheaterSeatInventory(streamingId);

      expect(mockRepo.findAllByStreamingId).toHaveBeenCalledOnce();
      expect(mockRepo.findAllByStreamingId).toHaveBeenCalledWith(streamingId);
    });

    it("should return the seat inventory list from the repository", async () => {
      const expected: TheaterSeatInventory[] = [
        buildSeatInventory({ id: "inv-1", seat: { id: "s1", seatNumber: "A1" }, status: "AVAILABLE" }),
        buildSeatInventory({ id: "inv-2", seat: { id: "s2", seatNumber: "A2" }, status: "BOOKED" }),
        buildSeatInventory({ id: "inv-3", seat: { id: "s3", seatNumber: "B1" }, status: "HELD", price: 300 }),
      ];
      mockRepo.findAllByStreamingId.mockResolvedValue(expected);

      const result = await service.getStreamingTheaterSeatInventory("streaming-1");

      expect(result).toEqual(expected);
      expect(result).toHaveLength(3);
    });

    it("should return an empty array when no inventory exists", async () => {
      mockRepo.findAllByStreamingId.mockResolvedValue([]);

      const result = await service.getStreamingTheaterSeatInventory("non-existent-id");

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should propagate repository errors", async () => {
      const dbError = new Error("Database connection failed");
      mockRepo.findAllByStreamingId.mockRejectedValue(dbError);

      await expect(
        service.getStreamingTheaterSeatInventory("streaming-1"),
      ).rejects.toThrow("Database connection failed");
    });

    it("should not mutate the data returned by the repository", async () => {
      const inventory = [buildSeatInventory()];
      mockRepo.findAllByStreamingId.mockResolvedValue(inventory);

      const result = await service.getStreamingTheaterSeatInventory("streaming-1");

      expect(result).toBe(inventory); // same reference — service is a pure pass-through
    });
  });
});
