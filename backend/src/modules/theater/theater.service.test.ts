import TheaterService from "./theater.service";
import TheaterRepository from "./repository/theater.repository";
import TheaterShowRepository from "./repository/theater-show.repository";
import NotFoundError from "@/core/error/types/NotFoundError";
import TheaterErrorCode from "./TheaterErrorCode";
import { Theater } from "./entity/theater.entity";
import { TheaterShow } from "./entity/theater-show.entity";

// ── Mocks ──────────────────────────────────────────────────────

const mockTheaterRepository = {
  findByCity: vi.fn(),
  findById: vi.fn(),
} as unknown as TheaterRepository;

const mockTheaterShowRepository = {
  findByTheater: vi.fn(),
} as unknown as TheaterShowRepository;

// ── Fixtures ───────────────────────────────────────────────────

const now = new Date();

const theaterFixture: Theater = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "PVR Superplex",
  city: "Noida",
  avatarUrl: "https://example.com/pvr.jpg",
  address: "Mall of India, Sector 18, Noida",
  rating: 4.8,
  seatingCapacity: 168,
  createdAt: now,
  updatedAt: now,
};

const theaterFixture2: Theater = {
  id: "660e8400-e29b-41d4-a716-446655440001",
  name: "Cinepolis DLF",
  city: "Noida",
  avatarUrl: "https://example.com/cinepolis.jpg",
  address: "DLF Mall of India, Sector 18, Noida",
  rating: 4.6,
  seatingCapacity: 142,
  createdAt: now,
  updatedAt: now,
};

const theaterShowFixture: TheaterShow = {
  id: "770e8400-e29b-41d4-a716-446655440002",
  movie: {
    id: "880e8400-e29b-41d4-a716-446655440003",
    title: "Inception",
    posterUrl: "https://example.com/inception.jpg",
    language: "English",
  },
  onDate: new Date("2026-08-06"),
  startTime: new Date("2026-08-06T14:00:00Z"),
  onwardsAmount: 250,
  createdAt: now,
  updatedAt: now,
};

// ── Service instance ───────────────────────────────────────────

let theaterService: TheaterService;

beforeEach(() => {
  vi.clearAllMocks();
  theaterService = new TheaterService(
    mockTheaterRepository,
    mockTheaterShowRepository,
  );
});

// ── Tests ──────────────────────────────────────────────────────

describe("TheaterService", () => {
  describe("getCityTheaters", () => {
    it("should return theaters for a given city", async () => {
      const theaters = [theaterFixture, theaterFixture2];
      vi.mocked(mockTheaterRepository.findByCity).mockResolvedValue(theaters);

      const result = await theaterService.getCityTheaters("Noida");

      expect(result).toEqual(theaters);
      expect(result).toHaveLength(2);
      expect(mockTheaterRepository.findByCity).toHaveBeenCalledWith("Noida");
      expect(mockTheaterRepository.findByCity).toHaveBeenCalledOnce();
    });

    it("should return an empty array when no theaters exist in city", async () => {
      vi.mocked(mockTheaterRepository.findByCity).mockResolvedValue([]);

      const result = await theaterService.getCityTheaters("UnknownCity");

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockTheaterRepository.findByCity).toHaveBeenCalledOnce();
    });
  });

  describe("getTheaterDetails", () => {
    it("should return a theater when found by id", async () => {
      vi.mocked(mockTheaterRepository.findById).mockResolvedValue(theaterFixture);

      const result = await theaterService.getTheaterDetails(theaterFixture.id);

      expect(result).toEqual(theaterFixture);
      expect(mockTheaterRepository.findById).toHaveBeenCalledWith(theaterFixture.id);
      expect(mockTheaterRepository.findById).toHaveBeenCalledOnce();
    });

    it("should throw NotFoundError when theater does not exist", async () => {
      const nonExistentId = "999e8400-e29b-41d4-a716-446655440099";
      vi.mocked(mockTheaterRepository.findById).mockResolvedValue(null);

      await expect(
        theaterService.getTheaterDetails(nonExistentId),
      ).rejects.toThrow(NotFoundError);

      expect(mockTheaterRepository.findById).toHaveBeenCalledWith(nonExistentId);
    });

    it("should throw NotFoundError with correct error code", async () => {
      vi.mocked(mockTheaterRepository.findById).mockResolvedValue(null);

      await expect(
        theaterService.getTheaterDetails("any-id"),
      ).rejects.toMatchObject({
        message: "Theater not found",
        code: TheaterErrorCode.THEATER_NOT_FOUND,
        statusCode: 404,
      });
    });
  });

  describe("getTheaterShows", () => {
    const input = {
      theaterId: theaterFixture.id,
      options: { date: new Date("2026-08-06") },
    };

    it("should return shows for a given theater and date", async () => {
      const shows = [theaterShowFixture];
      vi.mocked(mockTheaterShowRepository.findByTheater).mockResolvedValue(shows);

      const result = await theaterService.getTheaterShows(input);

      expect(result).toEqual(shows);
      expect(result).toHaveLength(1);
      expect(mockTheaterShowRepository.findByTheater).toHaveBeenCalledWith(
        input.theaterId,
        input.options,
      );
      expect(mockTheaterShowRepository.findByTheater).toHaveBeenCalledOnce();
    });

    it("should return an empty array when no shows are found", async () => {
      vi.mocked(mockTheaterShowRepository.findByTheater).mockResolvedValue([]);

      const result = await theaterService.getTheaterShows(input);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockTheaterShowRepository.findByTheater).toHaveBeenCalledWith(
        input.theaterId,
        input.options,
      );
    });

    it("should pass the correct theaterId and options to the repository", async () => {
      vi.mocked(mockTheaterShowRepository.findByTheater).mockResolvedValue([]);

      const customInput = {
        theaterId: theaterFixture2.id,
        options: { date: new Date("2026-12-25") },
      };

      await theaterService.getTheaterShows(customInput);

      expect(mockTheaterShowRepository.findByTheater).toHaveBeenCalledWith(
        customInput.theaterId,
        customInput.options,
      );
    });
  });
});
