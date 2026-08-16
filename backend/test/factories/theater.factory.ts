import { prisma } from "@/core/prisma/prisma.client";
import { Prisma } from "@/generated/prisma/client";

export default abstract class TheaterFactory {
  static async createTheater(
    overrides: Partial<Prisma.TheaterCreateInput> = {},
  ): Promise<any> {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return prisma.theater.create({
      data: {
        name: overrides.name ?? `Theater ${randomSuffix}`,
        city: overrides.city ?? "Mumbai",
        address: overrides.address ?? "123 Cinema Street",
        rating: overrides.rating ?? 4.5,
        avatarUrl: overrides.avatarUrl ?? "https://example.com/theater.jpg",
        seatingCapacity: overrides.seatingCapacity ?? 100,
        ...overrides,
      },
    });
  }

  static async findById(id: string) {
    return prisma.theater.findUnique({
      where: { id },
    });
  }
}
