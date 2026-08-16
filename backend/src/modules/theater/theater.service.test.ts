import { describe, expect, it, vi, type Mock } from "vitest";
import TheaterService from "./theater.service";
import type TheaterRepository from "./repository/theater.repository";
import type { Theater } from "./entity/theater.entity";
import type { TheaterShows } from "./entity/theater-shows.entity";
import type { GetTheaterShowsDto } from "./dto/GetTheaterShowsDto";
import { TheaterNotFoundError } from "./error/errors";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const now = new Date();

const mockTheater: Theater = {
  id: "theater-1",
  name: "PVR Cinemas",
  city: "Mumbai",
  address: "123 Main Street",
  rating: 4.5,
  avatarUrl: "https://example.com/pvr.jpg",
  seatingCapacity: 200,
  createdAt: now,
  updatedAt: now,
};

const mockTheaterShows: TheaterShows = {
  theaterId: "theater-1",
  onDate: "2026-08-15",
  movies: [
    {
      movieId: "movie-1",
      title: "Inception",
      posterUrl: "https://example.com/inception.jpg",
      language: "English",
      shows: [
        {
          id: "show-1",
          startTime: "10:00",
          endTime: "12:30",
          basePrice: 250,
        },
        {
          id: "show-2",
          startTime: "14:00",
          endTime: "16:30",
          basePrice: 300,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Factory for mocked dependencies
// ---------------------------------------------------------------------------
function createMocks() {
  const theaterRepo: Record<string, Mock> = {
    findById: vi.fn(),
    findShowByTheaterId: vi.fn(),
  };

  const theaterService = new (TheaterService as any)(theaterRepo);

  return {
    theaterService: theaterService as TheaterService,
    theaterRepo: theaterRepo as unknown as TheaterRepository,
  };
}

// ===========================================================================
// GET THEATER DETAILS
// ===========================================================================
describe("getTheaterDetails", () => {
  it("should return the theater when it exists", async () => {
    const { theaterService, theaterRepo } = createMocks();
    (theaterRepo.findById as Mock).mockResolvedValue(mockTheater);

    const result = await theaterService.getTheaterDetails("theater-1");

    expect(theaterRepo.findById).toHaveBeenCalledWith("theater-1");
    expect(result).toEqual(mockTheater);
  });

  it("should throw TheaterNotFoundError when theater does not exist", async () => {
    const { theaterService, theaterRepo } = createMocks();
    (theaterRepo.findById as Mock).mockResolvedValue(null);

    await expect(
      theaterService.getTheaterDetails("nonexistent-id"),
    ).rejects.toThrow(TheaterNotFoundError);

    expect(theaterRepo.findById).toHaveBeenCalledWith("nonexistent-id");
  });

  it("should propagate errors from theaterRepo.findById", async () => {
    const { theaterService, theaterRepo } = createMocks();
    (theaterRepo.findById as Mock).mockRejectedValue(new Error("DB error"));

    await expect(
      theaterService.getTheaterDetails("theater-1"),
    ).rejects.toThrow("DB error");
  });
});

// ===========================================================================
// GET THEATER SHOWS
// ===========================================================================
describe("getTheaterShows", () => {
  const validInput: GetTheaterShowsDto = {
    theaterId: "theater-1",
    options: { date: "2026-08-15" },
  };

  it("should return theater shows when the theater exists", async () => {
    const { theaterService, theaterRepo } = createMocks();
    (theaterRepo.findById as Mock).mockResolvedValue(mockTheater);
    (theaterRepo.findShowByTheaterId as Mock).mockResolvedValue(
      mockTheaterShows,
    );

    const result = await theaterService.getTheaterShows(validInput);

    // Verifies theater existence check
    expect(theaterRepo.findById).toHaveBeenCalledWith("theater-1");

    // Verifies shows lookup with correct args
    expect(theaterRepo.findShowByTheaterId).toHaveBeenCalledWith("theater-1", {
      date: "2026-08-15",
    });

    expect(result).toEqual(mockTheaterShows);
  });

  it("should throw TheaterNotFoundError when theater does not exist", async () => {
    const { theaterService, theaterRepo } = createMocks();
    (theaterRepo.findById as Mock).mockResolvedValue(null);

    await expect(theaterService.getTheaterShows(validInput)).rejects.toThrow(
      TheaterNotFoundError,
    );

    expect(theaterRepo.findById).toHaveBeenCalledWith("theater-1");
    expect(theaterRepo.findShowByTheaterId).not.toHaveBeenCalled();
  });

  it("should return shows with an empty movies array when none match", async () => {
    const { theaterService, theaterRepo } = createMocks();
    const emptyShows: TheaterShows = {
      theaterId: "theater-1",
      onDate: "2026-08-15",
      movies: [],
    };
    (theaterRepo.findById as Mock).mockResolvedValue(mockTheater);
    (theaterRepo.findShowByTheaterId as Mock).mockResolvedValue(emptyShows);

    const result = await theaterService.getTheaterShows(validInput);

    expect(result.movies).toEqual([]);
  });

  it("should propagate errors from theaterRepo.findShowByTheaterId", async () => {
    const { theaterService, theaterRepo } = createMocks();
    (theaterRepo.findById as Mock).mockResolvedValue(mockTheater);
    (theaterRepo.findShowByTheaterId as Mock).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(theaterService.getTheaterShows(validInput)).rejects.toThrow(
      "DB error",
    );
  });
});
