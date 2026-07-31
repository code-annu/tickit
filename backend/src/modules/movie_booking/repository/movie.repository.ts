import { prisma } from "@/config/prisma.client";
import { injectable } from "inversify";
import { Movie } from "../entity/movie.entity";

@injectable()
export default class MovieRepository {
  constructor(private readonly db = prisma) {}

  async findById(id: string): Promise<Movie | null> {
    const result = await this.db.movie.findUnique({
      where: { id },
    });
    return result;
  }

  async listStreamings(): Promise<Movie[]> {
    const results = await this.db.movie.findMany();
    return results;
  }
}
