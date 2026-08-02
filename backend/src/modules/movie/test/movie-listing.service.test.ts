import { Movie } from "../domain/entity/movie.entity";
import { Theater } from "../domain/entity/theater.entity";
import { StreamingTheater } from "../domain/entity/streaming-theater.entity";
import MovieListingService from "../domain/service/movie-listing.service";
import NotFoundError from "@/shared/error/types/NotFoundError";
import MovieErrorCode from "../domain/errors/MovieErrorCode";

const movieRepo = {
  findById: vi.fn(),
  list: vi.fn(),
};

const streamingTheaterRepo = {
  listTheatersForMovie: vi.fn(),
};

const movieListingService = new MovieListingService(
  movieRepo as any,
  streamingTheaterRepo as any,
);

const now = new Date();

const movies: Movie[] = [
  {
    id: "movie-1",
    title: "Inception",
    posterUrl: "https://example.com/inception.jpg",
    releasedDate: new Date("2010-07-16"),
    overview: "A thief who steals corporate secrets through dream-sharing technology.",
    language: "English",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "movie-2",
    title: "Interstellar",
    posterUrl: "https://example.com/interstellar.jpg",
    releasedDate: new Date("2014-11-07"),
    overview: "A team of explorers travel through a wormhole in space.",
    language: "English",
    createdAt: now,
    updatedAt: now,
  },
];

const theater: Theater = {
  id: "theater-1",
  name: "PVR Cinemas",
  city: "Mumbai",
  address: "123 Main Street",
  avatarUrl: "https://example.com/pvr.jpg",
  rating: 4.5,
  createdAt: now,
  updatedAt: now,
};

const streamingTheaters: StreamingTheater[] = [
  {
    id: "st-1",
    theater,
    onDate: new Date("2026-08-03"),
    startTime: new Date("2026-08-03T10:00:00Z"),
    endTime: new Date("2026-08-03T12:30:00Z"),
    duration: 150,
    onwardsAmount: 250,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "st-2",
    theater,
    onDate: new Date("2026-08-03"),
    startTime: new Date("2026-08-03T14:00:00Z"),
    endTime: new Date("2026-08-03T16:30:00Z"),
    duration: 150,
    onwardsAmount: 300,
    createdAt: now,
    updatedAt: now,
  },
];

describe("getMovieListings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should return a list of movies", async () => {
    movieRepo.list.mockResolvedValue(movies);

    const result = await movieListingService.getMovieListings();

    expect(result).toEqual(movies);
    expect(result).toHaveLength(2);
    expect(movieRepo.list).toHaveBeenCalledTimes(1);
  });

  it("Should return an empty array when no movies exist", async () => {
    movieRepo.list.mockResolvedValue([]);

    const result = await movieListingService.getMovieListings();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(movieRepo.list).toHaveBeenCalledTimes(1);
  });
});

describe("getMovieById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should return a movie when found by id", async () => {
    movieRepo.findById.mockResolvedValue(movies[0]);

    const result = await movieListingService.getMovieById("movie-1");

    expect(result).toEqual(movies[0]);
    expect(result.id).toBe("movie-1");
    expect(result.title).toBe("Inception");
    expect(movieRepo.findById).toHaveBeenCalledWith("movie-1");
    expect(movieRepo.findById).toHaveBeenCalledTimes(1);
  });

  it("Should throw NotFoundError when movie does not exist", async () => {
    movieRepo.findById.mockResolvedValue(null);

    await expect(
      movieListingService.getMovieById("non-existent-id"),
    ).rejects.toThrow(NotFoundError);
    expect(movieRepo.findById).toHaveBeenCalledWith("non-existent-id");
    expect(movieRepo.findById).toHaveBeenCalledTimes(1);
  });

  it("Should throw NotFoundError with correct error code", async () => {
    movieRepo.findById.mockResolvedValue(null);

    try {
      await movieListingService.getMovieById("non-existent-id");
      expect.unreachable("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect((error as NotFoundError).code).toBe(
        MovieErrorCode.MOVIE_NOT_FOUND,
      );
      expect((error as NotFoundError).message).toBe("Movie not found");
      expect((error as NotFoundError).statusCode).toBe(404);
    }
  });
});

describe("getStreamingTheatersForMovie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const options = {
    city: "Mumbai",
    date: new Date("2026-08-03"),
  };

  it("Should return streaming theaters for a given movie", async () => {
    streamingTheaterRepo.listTheatersForMovie.mockResolvedValue(
      streamingTheaters,
    );

    const result = await movieListingService.getStreamingTheatersForMovie(
      "movie-1",
      options,
    );

    expect(result).toEqual(streamingTheaters);
    expect(result).toHaveLength(2);
    expect(streamingTheaterRepo.listTheatersForMovie).toHaveBeenCalledWith(
      "movie-1",
      options,
    );
    expect(
      streamingTheaterRepo.listTheatersForMovie,
    ).toHaveBeenCalledTimes(1);
  });

  it("Should return an empty array when no streaming theaters exist", async () => {
    streamingTheaterRepo.listTheatersForMovie.mockResolvedValue([]);

    const result = await movieListingService.getStreamingTheatersForMovie(
      "movie-1",
      options,
    );

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(streamingTheaterRepo.listTheatersForMovie).toHaveBeenCalledWith(
      "movie-1",
      options,
    );
    expect(
      streamingTheaterRepo.listTheatersForMovie,
    ).toHaveBeenCalledTimes(1);
  });

  it("Should pass correct movieId and options to repository", async () => {
    streamingTheaterRepo.listTheatersForMovie.mockResolvedValue([]);
    const customOptions = {
      city: "Delhi",
      date: new Date("2026-09-15"),
    };

    await movieListingService.getStreamingTheatersForMovie(
      "movie-2",
      customOptions,
    );

    expect(streamingTheaterRepo.listTheatersForMovie).toHaveBeenCalledWith(
      "movie-2",
      customOptions,
    );
  });
});
