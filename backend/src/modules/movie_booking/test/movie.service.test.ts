import { describe } from "vitest";
import MovieService from "../service/movie.service";
import { Movie } from "../entity/movie.entity";
import NotFoundError from "@/shared/error/types/NotFoundError";

const movieRepo = {
  findById: vi.fn(),
  listStreamings: vi.fn(),
};

const movieService = new MovieService(movieRepo as any);

const movie: Movie = {
  id: "movie-1",
  title: "Inception",
  posterUrl: "https://example.com/inception.jpg",
  releasedDate: new Date("2010-07-16"),
  overview: "A thief who steals corporate secrets through dream-sharing technology.",
  language: "English",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Get movie by id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should return movie", async () => {
    movieRepo.findById.mockResolvedValue(movie);
    const result = await movieService.getMovieById("movie-1");

    expect(result).toEqual(movie);
    expect(movieRepo.findById).toHaveBeenCalledWith("movie-1");
  });

  it("Should throw error for movie not found", async () => {
    movieRepo.findById.mockResolvedValue(null);
    await expect(movieService.getMovieById("movie-1")).rejects.toThrow(
      NotFoundError,
    );
    expect(movieRepo.findById).toHaveBeenCalledWith("movie-1");
  });
});

describe("Get streaming movies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should return list of movies", async () => {
    const movies: Movie[] = [
      movie,
      {
        id: "movie-2",
        title: "The Dark Knight",
        posterUrl: "https://example.com/dark-knight.jpg",
        releasedDate: new Date("2008-07-18"),
        overview: "Batman raises the stakes in his war on crime.",
        language: "English",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    movieRepo.listStreamings.mockResolvedValue(movies);
    const result = await movieService.getStreamingMovies();

    expect(result).toEqual(movies);
    expect(movieRepo.listStreamings).toHaveBeenCalled();
  });

  it("Should return empty list when no movies exist", async () => {
    movieRepo.listStreamings.mockResolvedValue([]);
    const result = await movieService.getStreamingMovies();

    expect(result).toEqual([]);
    expect(movieRepo.listStreamings).toHaveBeenCalled();
  });
});
