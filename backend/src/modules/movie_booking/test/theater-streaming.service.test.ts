import TheaterStreamingService from "../service/theater-streaming.service";
import { TheaterStreaming } from "../entity/theater-streaming.entity";

const theaterStreamingRepo = {
  findStreamingFor: vi.fn(),
};

const theaterStreamingService = new TheaterStreamingService(
  theaterStreamingRepo as any,
);

const now = new Date();

const streaming: TheaterStreaming = {
  id: "streaming-1",
  theater: {
    id: "theater-1",
    name: "PVR Cinemas",
    city: "Mumbai",
    address: "123 Main Street, Andheri West",
    avatarUrl: "https://example.com/pvr.jpg",
    rating: 4.5,
    createdAt: now,
    updatedAt: now,
  },
  onDate: new Date("2026-08-10"),
  startTime: new Date("2026-08-10T14:00:00"),
  endTime: new Date("2026-08-10T16:30:00"),
  duration: 150,
  onwardsAmount: 250,
  createdAt: now,
  updatedAt: now,
};

describe("Get theaters for movie in city", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should return streaming theaters for a movie", async () => {
    const streamings: TheaterStreaming[] = [
      streaming,
      {
        ...streaming,
        id: "streaming-2",
        startTime: new Date("2026-08-10T18:00:00"),
        endTime: new Date("2026-08-10T20:30:00"),
      },
    ];
    theaterStreamingRepo.findStreamingFor.mockResolvedValue(streamings);

    const result = await theaterStreamingService.getTheatersForMovieInCity(
      "movie-1",
      { city: "Mumbai", date: new Date("2026-08-10") },
    );

    expect(result).toEqual(streamings);
    expect(theaterStreamingRepo.findStreamingFor).toHaveBeenCalledWith(
      "movie-1",
      { city: "Mumbai", date: new Date("2026-08-10") },
    );
  });

  it("Should return empty list when no streamings exist", async () => {
    theaterStreamingRepo.findStreamingFor.mockResolvedValue([]);

    const result = await theaterStreamingService.getTheatersForMovieInCity(
      "movie-1",
      { city: "Delhi", date: new Date("2026-08-10") },
    );

    expect(result).toEqual([]);
    expect(theaterStreamingRepo.findStreamingFor).toHaveBeenCalledWith(
      "movie-1",
      { city: "Delhi", date: new Date("2026-08-10") },
    );
  });

  it("Should call repository exactly once", async () => {
    theaterStreamingRepo.findStreamingFor.mockResolvedValue([streaming]);

    await theaterStreamingService.getTheatersForMovieInCity("movie-1", {
      city: "Mumbai",
      date: new Date("2026-08-10"),
    });

    expect(theaterStreamingRepo.findStreamingFor).toHaveBeenCalledTimes(1);
  });

  it("Should propagate repository errors", async () => {
    theaterStreamingRepo.findStreamingFor.mockRejectedValue(
      new Error("Database connection failed"),
    );

    await expect(
      theaterStreamingService.getTheatersForMovieInCity("movie-1", {
        city: "Mumbai",
        date: new Date("2026-08-10"),
      }),
    ).rejects.toThrow("Database connection failed");
  });
});
