import { injectable } from "inversify";
import { prisma } from "@/core/prisma/prisma.client";
import { Movie } from "../entity/movie.entity";

@injectable()
export default class MovieRepository {
  private readonly db = prisma;
  
  async findAll(): Promise<Movie[]> {
    return this.db.movie.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<Movie | null> {
    return this.db.movie.findUnique({
      where: { id },
    });
  }
}
