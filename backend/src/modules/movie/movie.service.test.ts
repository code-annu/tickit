import MovieService from "./movie.service";
import MovieRepository from "./repository/movie.repository";
import MovieShowRepository from "./repository/movie-show.repository";
import NotFoundError from "@/core/error/types/NotFoundError";
import MovieErrorCode from "./MovieErrorCode";
import { Movie } from "./entity/movie.entity";
import { MovieShow } from "./entity/movie-show.entity";

// ── Mocks ──────────────────────────────────────────────────────

const mockMovieRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
} as unknown as MovieRepository;

const mockMovieShowRepository = {
  findForMovie: vi.fn(),
} as unknown as MovieShowRepository;

// ── Fixtures ───────────────────────────────────────────────────

const now = new Date();

const movieFixture: Movie = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Inception",
  posterUrl: "https://example.com/inception.jpg",
  language: "English",
  overview: "A mind-bending thriller",
  releasedDate: new Date("2010-07-16"),
  createdAt: now,
  updatedAt: now,
};

const movieFixture2: Movie = {
  id: "660e8400-e29b-41d4-a716-446655440001",
  title: "Interstellar",
  posterUrl: "https://example.com/interstellar.jpg",
  language: "English",
  overview: "A space odyssey",
  releasedDate: new Date("2014-11-07"),
  createdAt: now,
  updatedAt: now,
};

const movieShowFixture: MovieShow = {
  id: "770e8400-e29b-41d4-a716-446655440002",
  theater: {
    id: "880e8400-e29b-41d4-a716-446655440003",
    name: "PVR Cinemas",
    city: "Mumbai",
    address: "123 Main St",
    avatarUrl: "https://example.com/pvr.jpg",
    rating: 4.5,
  },
  onDate: new Date("2026-08-06"),
  startTime: new Date("2026-08-06T14:00:00Z"),
  onwardsPrice: 250,
};

// ── Service instance ───────────────────────────────────────────

let movieService: MovieService;

beforeEach(() => {
  vi.clearAllMocks();
  movieService = new MovieService(
    mockMovieRepository,
    mockMovieShowRepository,
  );
});

// ── Tests ──────────────────────────────────────────────────────

describe("MovieService", () => {
  describe("getAllMovies", () => {
    it("should return all movies", async () => {
      const movies = [movieFixture, movieFixture2];
      vi.mocked(mockMovieRepository.findAll).mockResolvedValue(movies);

      const result = await movieService.getAllMovies();

      expect(result).toEqual(movies);
      expect(result).toHaveLength(2);
      expect(mockMovieRepository.findAll).toHaveBeenCalledOnce();
    });

    it("should return an empty array when no movies exist", async () => {
      vi.mocked(mockMovieRepository.findAll).mockResolvedValue([]);

      const result = await movieService.getAllMovies();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockMovieRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe("getMovieDetails", () => {
    it("should return a movie when found by id", async () => {
      vi.mocked(mockMovieRepository.findById).mockResolvedValue(movieFixture);

      const result = await movieService.getMovieDetails(movieFixture.id);

      expect(result).toEqual(movieFixture);
      expect(mockMovieRepository.findById).toHaveBeenCalledWith(
        movieFixture.id,
      );
      expect(mockMovieRepository.findById).toHaveBeenCalledOnce();
    });

    it("should throw NotFoundError when movie does not exist", async () => {
      const nonExistentId = "999e8400-e29b-41d4-a716-446655440099";
      vi.mocked(mockMovieRepository.findById).mockResolvedValue(null);

      await expect(
        movieService.getMovieDetails(nonExistentId),
      ).rejects.toThrow(NotFoundError);

      expect(mockMovieRepository.findById).toHaveBeenCalledWith(
        nonExistentId,
      );
    });

    it("should throw NotFoundError with correct error code", async () => {
      vi.mocked(mockMovieRepository.findById).mockResolvedValue(null);

      await expect(
        movieService.getMovieDetails("any-id"),
      ).rejects.toMatchObject({
        message: "Movie not found",
        code: MovieErrorCode.MOVIE_NOT_FOUND,
        statusCode: 404,
      });
    });
  });

  describe("getMovieShows", () => {
    const input = {
      movieId: movieFixture.id,
      options: {
        city: "Mumbai",
        date: new Date("2026-08-06"),
      },
    };

    it("should return shows for a given movie, city, and date", async () => {
      const shows = [movieShowFixture];
      vi.mocked(mockMovieShowRepository.findForMovie).mockResolvedValue(shows);

      const result = await movieService.getMovieShows(input);

      expect(result).toEqual(shows);
      expect(result).toHaveLength(1);
      expect(mockMovieShowRepository.findForMovie).toHaveBeenCalledWith(
        input.movieId,
        input.options,
      );
      expect(mockMovieShowRepository.findForMovie).toHaveBeenCalledOnce();
    });

    it("should return an empty array when no shows are found", async () => {
      vi.mocked(mockMovieShowRepository.findForMovie).mockResolvedValue([]);

      const result = await movieService.getMovieShows(input);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockMovieShowRepository.findForMovie).toHaveBeenCalledWith(
        input.movieId,
        input.options,
      );
    });

    it("should pass the correct movieId and options to the repository", async () => {
      vi.mocked(mockMovieShowRepository.findForMovie).mockResolvedValue([]);

      const customInput = {
        movieId: movieFixture2.id,
        options: {
          city: "Delhi",
          date: new Date("2026-12-25"),
        },
      };

      await movieService.getMovieShows(customInput);

      expect(mockMovieShowRepository.findForMovie).toHaveBeenCalledWith(
        customInput.movieId,
        customInput.options,
      );
    });
  });
});
