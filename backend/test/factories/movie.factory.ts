import { prisma } from "@/core/prisma/prisma.client";
import { Prisma } from "@/generated/prisma/client";

export default abstract class MovieFactory {
  static async createMovie(
    overrides: Partial<Prisma.MovieCreateInput> = {},
  ): Promise<any> {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return prisma.movie.create({
      data: {
        title: overrides.title ?? `Movie ${randomSuffix}`,
        overview: overrides.overview ?? "A test movie overview description.",
        durationMin: overrides.durationMin ?? 120,
        language: overrides.language ?? "English",
        releaseDate: overrides.releaseDate ?? new Date("2026-08-15"),
        posterUrl: overrides.posterUrl ?? "https://example.com/poster.jpg",
        ...overrides,
      },
    });
  }

  static async createManyMovies(
    count: number,
    overrides: Partial<Prisma.MovieCreateInput> = {},
  ): Promise<any[]> {
    const movies = [];
    for (let i = 0; i < count; i++) {
      movies.push(
        await this.createMovie({
          title: `Movie ${i + 1} ${Math.random().toString(36).substring(2, 6)}`,
          ...overrides,
        }),
      );
    }
    return movies;
  }

  static async findById(id: string) {
    return prisma.movie.findUnique({
      where: { id },
    });
  }

  static async findAll() {
    return prisma.movie.findMany();
  }
}
