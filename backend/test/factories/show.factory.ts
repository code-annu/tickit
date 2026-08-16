import { prisma } from "@/core/prisma/prisma.client";
import { Prisma } from "@/generated/prisma/client";

export default abstract class ShowFactory {
  static async createShow(
    movieId: string,
    theaterId: string,
    overrides: Partial<Prisma.ShowUncheckedCreateInput> = {},
  ): Promise<any> {
    const onDate = overrides.onDate ?? new Date("2026-08-15");
    const startTime =
      overrides.startTime ?? new Date(Date.UTC(1970, 0, 1, 10, 0, 0));
    const endTime =
      overrides.endTime ?? new Date(Date.UTC(1970, 0, 1, 12, 30, 0));
    const basePrice = overrides.basePrice ?? 250;

    return prisma.show.create({
      data: {
        movieId,
        theaterId,
        onDate,
        startTime,
        endTime,
        basePrice,
        ...overrides,
      },
    });
  }

  static async findById(id: string) {
    return prisma.show.findUnique({
      where: { id },
    });
  }
}
