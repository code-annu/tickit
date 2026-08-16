import TYPES from "@/core/di/inversify.types";
import { prisma } from "@/core/prisma/prisma.client";
import { inject, injectable } from "inversify";
import MovieMapper from "../movie.mapper";
import { Movie } from "../entity/movie.entity";
import { MovieShows } from "../entity/movie-shows.entity";

@injectable()
export default class MovieRepository {
  private readonly db = prisma;

  constructor(
    @inject(TYPES.MovieMapper) private readonly mapper: MovieMapper,
  ) {}

  async listAll(): Promise<Movie[]> {
    const movies = await this.db.movie.findMany();
    return movies.map(this.mapper.toMovieEntity);
  }

  async findById(id: string): Promise<Movie | null> {
    const movie = await this.db.movie.findUnique({
      where: { id },
    });
    return movie ? this.mapper.toMovieEntity(movie) : null;
  }

  async findShowsByMovieId(
    movieId: string,
    options: { date: string; city: string },
  ): Promise<MovieShows> {
    const targetDate = new Date(options.date);
    const theaters = await this.db.theater.findMany({
      where: {
        city: { equals: options.city, mode: "insensitive" },
        shows: { some: { movieId, onDate: targetDate } },
      },
      include: {
        shows: {
          where: { movieId, onDate: targetDate },
          orderBy: { startTime: "asc" },
        },
      },
    });
    return this.mapper.toMovieShowsEntity(movieId, options.date, theaters);
  }
}
