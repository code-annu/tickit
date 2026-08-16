import { prisma } from "@/core/prisma/prisma.client";

export async function resetDb() {
  await prisma.seatHoldItem.deleteMany();
  await prisma.seatHold.deleteMany();
  await prisma.showSeat.deleteMany();
  await prisma.show.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.theater.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

