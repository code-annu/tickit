import { injectable } from "inversify";
import { prisma } from "@/core/prisma/prisma.client";
import { Theater } from "../entity/theater.entity";

@injectable()
export default class TheaterRepository {
  private readonly db = prisma;

  async findByCity(city: string): Promise<Theater[]> {
    return this.db.theater.findMany({
      where: { city: { equals: city, mode: "insensitive" } },
      orderBy: { rating: "desc" },
    });
  }

  async findById(id: string): Promise<Theater | null> {
    return this.db.theater.findUnique({ where: { id } });
  }
}
