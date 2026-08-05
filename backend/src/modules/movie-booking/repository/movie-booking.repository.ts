import { prisma } from "@/config/prisma.client";
import { inject, injectable } from "inversify";
import { MovieBooking } from "../entity/movie-booking.entity";
import { Prisma } from "@/generated/prisma";
import TYPES from "@/di/inversify.types";
import MovieBookingMapper from "../mapper/movie-booking.mapper";

const bookingIncludes = {
  streaming: { include: { movie: true, theater: true } },
  paymentTransaction: true,
  movieBookingSeats: {
    include: { inventory: { include: { seat: true } } },
  },
} as const;

@injectable()
export default class MovieBookingRepository {
  constructor(
    @inject(TYPES.MovieBookingMapper)
    private readonly mapper: MovieBookingMapper,
    private readonly db = prisma,
  ) {}

  async create(
    userId: string,
    data: Prisma.MovieBookingCreateWithoutUserInput,
  ): Promise<MovieBooking> {
    const booking = await this.db.movieBooking.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
      include: bookingIncludes,
    });

    return this.mapper.toEntity(booking);
  }

  async findById(id: string): Promise<MovieBooking | null> {
    const booking = await this.db.movieBooking.findUnique({
      where: { id },
      include: bookingIncludes,
    });

    if (!booking) return null;

    return this.mapper.toEntity(booking);
  }

  async listByUserId(userId: string): Promise<MovieBooking[]> {
    const bookings = await this.db.movieBooking.findMany({
      where: { userId },
      include: bookingIncludes,
      orderBy: { createdAt: "desc" },
    });

    return bookings.map((b) => this.mapper.toEntity(b));
  }
}
