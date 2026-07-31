import { prisma } from "@/config/prisma.client";

export async function resetDb() {
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.theater.deleteMany();
}
