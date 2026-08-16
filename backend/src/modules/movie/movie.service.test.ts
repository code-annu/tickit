import { vi, type Mock } from "vitest";
import MovieService from "./movie.service";
import type MovieRepository from "./repository/movie.repository";
import type { Movie } from "./entity/movie.entity";
import type { MovieShows } from "./entity/movie-shows.entity";
import type { GetMovieShowsDto } from "./dto/GetMovieShowsDto";
import { MovieNotFoundError } from "./error/errors";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const now = new Date();

const mockMovie: Movie = {
  id: "movie-1",
  title: "Inception",
  overview: "A mind-bending thriller",
  durationMin: 148,
  language: "English",
  releaseDate: "2010-07-16",
  posterUrl: "https://example.com/inception.jpg",
  createdAt: now,
  updatedAt: now,
};

const mockMovie2: Movie = {
  id: "movie-2",
  title: "Interstellar",
  overview: "A space exploration epic",
  durationMin: 169,
  language: "English",
  releaseDate: "2014-11-07",
  posterUrl: "https://example.com/interstellar.jpg",
  createdAt: now,
  updatedAt: now,
};

const mockMovieShows: MovieShows = {
  movieId: "movie-1",
  onDate: "2026-08-15",
  theaters: [
    {
      id: "theater-1",
      name: "PVR Cinemas",
      city: "Mumbai",
      avatarUrl: "https://example.com/pvr.jpg",
      address: "123 Main Street",
      rating: 4.5,
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
  const movieRepo: Record<string, Mock> = {
    listAll: vi.fn(),
    findById: vi.fn(),
    findShowsByMovieId: vi.fn(),
  };

  const movieService = new (MovieService as any)(movieRepo);

  return {
    movieService: movieService as MovieService,
    movieRepo: movieRepo as unknown as MovieRepository,
  };
}

// ===========================================================================
// GET ALL MOVIES
// ===========================================================================
describe("getAllMovies", () => {
  it("should return all movies from the repository", async () => {
    const { movieService, movieRepo } = createMocks();
    (movieRepo.listAll as Mock).mockResolvedValue([mockMovie, mockMovie2]);

    const result = await movieService.getAllMovies();

    expect(movieRepo.listAll).toHaveBeenCalledOnce();
    expect(result).toEqual([mockMovie, mockMovie2]);
  });

  it("should return an empty array when no movies exist", async () => {
    const { movieService, movieRepo } = createMocks();
    (movieRepo.listAll as Mock).mockResolvedValue([]);

    const result = await movieService.getAllMovies();

    expect(movieRepo.listAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
  });

  it("should propagate errors from movieRepo.listAll", async () => {
    const { movieService, movieRepo } = createMocks();
    (movieRepo.listAll as Mock).mockRejectedValue(new Error("DB error"));

    await expect(movieService.getAllMovies()).rejects.toThrow("DB error");
  });
});

// ===========================================================================
// GET MOVIE BY ID
// ===========================================================================
describe("getMovieById", () => {
  it("should return the movie when it exists", async () => {
    const { movieService, movieRepo } = createMocks();
    (movieRepo.findById as Mock).mockResolvedValue(mockMovie);

    const result = await movieService.getMovieById("movie-1");

    expect(movieRepo.findById).toHaveBeenCalledWith("movie-1");
    expect(result).toEqual(mockMovie);
  });

  it("should throw MovieNotFoundError when movie does not exist", async () => {
    const { movieService, movieRepo } = createMocks();
    (movieRepo.findById as Mock).mockResolvedValue(null);

    await expect(
      movieService.getMovieById("nonexistent-id"),
    ).rejects.toThrow(MovieNotFoundError);

    expect(movieRepo.findById).toHaveBeenCalledWith("nonexistent-id");
  });

  it("should propagate errors from movieRepo.findById", async () => {
    const { movieService, movieRepo } = createMocks();
    (movieRepo.findById as Mock).mockRejectedValue(new Error("DB error"));

    await expect(movieService.getMovieById("movie-1")).rejects.toThrow(
      "DB error",
    );
  });
});

// ===========================================================================
// GET MOVIE SHOWS
// ===========================================================================
describe("getMovieShows", () => {
  const validInput: GetMovieShowsDto = {
    movieId: "movie-1",
    options: { city: "Mumbai", date: "2026-08-15" },
  };

  it("should return movie shows when the movie exists", async () => {
    const { movieService, movieRepo } = createMocks();
    (movieRepo.findById as Mock).mockResolvedValue(mockMovie);
    (movieRepo.findShowsByMovieId as Mock).mockResolvedValue(mockMovieShows);

    const result = await movieService.getMovieShows(validInput);

    // Verifies movie existence check
    expect(movieRepo.findById).toHaveBeenCalledWith("movie-1");

    // Verifies shows lookup with correct args
    expect(movieRepo.findShowsByMovieId).toHaveBeenCalledWith("movie-1", {
      city: "Mumbai",
      date: "2026-08-15",
    });

    expect(result).toEqual(mockMovieShows);
  });

  it("should throw MovieNotFoundError when movie does not exist", async () => {
    const { movieService, movieRepo } = createMocks();
    (movieRepo.findById as Mock).mockResolvedValue(null);

    await expect(movieService.getMovieShows(validInput)).rejects.toThrow(
      MovieNotFoundError,
    );

    expect(movieRepo.findById).toHaveBeenCalledWith("movie-1");
    expect(movieRepo.findShowsByMovieId).not.toHaveBeenCalled();
  });

  it("should return shows with an empty theaters array when none match", async () => {
    const { movieService, movieRepo } = createMocks();
    const emptyShows: MovieShows = {
      movieId: "movie-1",
      onDate: "2026-08-15",
      theaters: [],
    };
    (movieRepo.findById as Mock).mockResolvedValue(mockMovie);
    (movieRepo.findShowsByMovieId as Mock).mockResolvedValue(emptyShows);

    const result = await movieService.getMovieShows(validInput);

    expect(result.theaters).toEqual([]);
  });

  it("should propagate errors from movieRepo.findShowsByMovieId", async () => {
    const { movieService, movieRepo } = createMocks();
    (movieRepo.findById as Mock).mockResolvedValue(mockMovie);
    (movieRepo.findShowsByMovieId as Mock).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(movieService.getMovieShows(validInput)).rejects.toThrow(
      "DB error",
    );
  });
});
