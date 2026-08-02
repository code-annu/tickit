import { prisma } from "@/config/prisma.client";
import { injectable } from "inversify";
import { Movie } from "../../domain/entity/movie.entity";

@injectable()
export default class MovieRepository {
  constructor(private readonly db = prisma) {}

  async findById(id: string): Promise<Movie | null> {
    const result = await this.db.movie.findUnique({
      where: { id },
    });
    return result;
  }

  async list(): Promise<Movie[]> {
    return await this.db.movie.findMany();
  }
}
