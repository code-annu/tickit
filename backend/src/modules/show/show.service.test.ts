import ShowService from "./show.service";
import ShowRepository from "./repository/show.repository";
import NotFoundError from "@/core/error/types/NotFoundError";
import ShowErrorCode from "./ShowErrorCode";
import { Show } from "./entity/show.entity";
import { ShowSeatInventory } from "./entity/show-seat-inventory.entity";

// ── Mocks ──────────────────────────────────────────────────────

const mockShowRepository = {
  findById: vi.fn(),
  findSeatMap: vi.fn(),
} as unknown as ShowRepository;

// ── Fixtures ───────────────────────────────────────────────────

const showFixture: Show = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  movie: {
    id: "660e8400-e29b-41d4-a716-446655440001",
    title: "Inception",
    posterUrl: "https://example.com/inception.jpg",
  },
  theater: {
    id: "770e8400-e29b-41d4-a716-446655440002",
    name: "PVR Superplex",
    address: "Mall of India, Sector 18, Noida",
  },
  onDate: "Wed Aug 12 2026",
  startTime: "14:00:00",
  endTime: "16:30:00",
  duration: 150,
  onwardAmount: 250,
};

const showSeatInventoryFixture: ShowSeatInventory = {
  showId: "550e8400-e29b-41d4-a716-446655440000",
  seats: [
    {
      id: "880e8400-e29b-41d4-a716-446655440003",
      rowName: "A",
      seatNumber: 1,
      status: "AVAILABLE",
      price: 250,
    },
    {
      id: "880e8400-e29b-41d4-a716-446655440004",
      rowName: "A",
      seatNumber: 2,
      status: "BOOKED",
      price: 250,
    },
  ],
  totalSeats: 2,
  availableSeats: 1,
  bookedSeats: 1,
  heldSeats: 0,
};

// ── Service instance ───────────────────────────────────────────

let showService: ShowService;

beforeEach(() => {
  vi.clearAllMocks();
  showService = new ShowService(mockShowRepository);
});

// ── Tests ──────────────────────────────────────────────────────

describe("ShowService", () => {
  describe("getShowDetails", () => {
    it("should return a show when found by id", async () => {
      vi.mocked(mockShowRepository.findById).mockResolvedValue(showFixture);

      const result = await showService.getShowDetails(showFixture.id);

      expect(result).toEqual(showFixture);
      expect(mockShowRepository.findById).toHaveBeenCalledWith(showFixture.id);
      expect(mockShowRepository.findById).toHaveBeenCalledOnce();
    });

    it("should throw NotFoundError when show does not exist", async () => {
      const nonExistentId = "999e8400-e29b-41d4-a716-446655440099";
      vi.mocked(mockShowRepository.findById).mockResolvedValue(null);

      await expect(showService.getShowDetails(nonExistentId)).rejects.toThrow(
        NotFoundError,
      );

      expect(mockShowRepository.findById).toHaveBeenCalledWith(nonExistentId);
    });

    it("should throw NotFoundError with correct error code and status", async () => {
      vi.mocked(mockShowRepository.findById).mockResolvedValue(null);

      await expect(showService.getShowDetails("any-id")).rejects.toMatchObject({
        message: "Show not found",
        code: ShowErrorCode.SHOW_NOT_FOUND,
        statusCode: 404,
      });
    });
  });

  describe("getShowSeatInventory", () => {
    it("should return seat inventory when found by showId", async () => {
      vi.mocked(mockShowRepository.findSeatMap).mockResolvedValue(
        showSeatInventoryFixture,
      );

      const result = await showService.getShowSeatInventory(
        showSeatInventoryFixture.showId,
      );

      expect(result).toEqual(showSeatInventoryFixture);
      expect(mockShowRepository.findSeatMap).toHaveBeenCalledWith(
        showSeatInventoryFixture.showId,
      );
      expect(mockShowRepository.findSeatMap).toHaveBeenCalledOnce();
    });

    it("should throw NotFoundError when show seat inventory does not exist", async () => {
      const nonExistentId = "999e8400-e29b-41d4-a716-446655440099";
      vi.mocked(mockShowRepository.findSeatMap).mockResolvedValue(null);

      await expect(
        showService.getShowSeatInventory(nonExistentId),
      ).rejects.toThrow(NotFoundError);

      expect(mockShowRepository.findSeatMap).toHaveBeenCalledWith(
        nonExistentId,
      );
    });

    it("should throw NotFoundError with correct error code and status", async () => {
      vi.mocked(mockShowRepository.findSeatMap).mockResolvedValue(null);

      await expect(
        showService.getShowSeatInventory("any-id"),
      ).rejects.toMatchObject({
        message: "Show not found",
        code: ShowErrorCode.SHOW_NOT_FOUND,
        statusCode: 404,
      });
    });
  });
});
