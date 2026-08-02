import { prisma } from "@/config/prisma.client";
import { injectable } from "inversify";
import { Theater } from "../../domain/entity/theater.entity";

@injectable()
export default class TheaterRepository {
  constructor(private readonly db = prisma) {}

  async findById(id: string): Promise<Theater | null> {
    const result = await this.db.theater.findUnique({
      where: { id },
    });
    return result ?? null;
  }
}
