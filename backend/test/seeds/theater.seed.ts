import { prisma } from "@/core/prisma/prisma.client";
import theaterData from "../data/theater.data.json";

export interface TheaterData {
  name: string;
  city: string;
  address: string;
  avatarUrl: string;
  rating: number;
  seatingCapacity: number;
}

/**
 * Generate seat row and number distribution for a theater based on seatingCapacity.
 * Organizes seats in realistic rows (A, B, C... with 12-16 seats per row).
 */
export function generateSeatsLayout(seatingCapacity: number, seatsPerRow = 14) {
  const seats: { rowName: string; seatNumber: number }[] = [];
  let allocated = 0;
  let rowIndex = 0;

  while (allocated < seatingCapacity) {
    const rowChar = String.fromCharCode(65 + (rowIndex % 26));
    const suffix = rowIndex >= 26 ? String(Math.floor(rowIndex / 26)) : "";
    const rowName = `${rowChar}${suffix}`;

    const remaining = seatingCapacity - allocated;
    const countInRow = Math.min(seatsPerRow, remaining);

    for (let seatNum = 1; seatNum <= countInRow; seatNum++) {
      seats.push({ rowName, seatNumber: seatNum });
    }

    allocated += countInRow;
    rowIndex++;
  }

  return seats;
}

export async function seedTheaters() {
  console.log("🏛️ Seeding theaters and seats...");
  const seededTheaters = [];

  for (const item of theaterData as TheaterData[]) {
    const existing = await prisma.theater.findFirst({
      where: {
        name: item.name,
        city: item.city,
      },
    });

    let theater;
    if (existing) {
      theater = await prisma.theater.update({
        where: { id: existing.id },
        data: {
          address: item.address,
          avatarUrl: item.avatarUrl,
          rating: item.rating,
          seatingCapacity: item.seatingCapacity,
        },
      });
      console.log(`  ✓ Updated theater: "${theater.name}" (${theater.city})`);
    } else {
      theater = await prisma.theater.create({
        data: {
          name: item.name,
          city: item.city,
          address: item.address,
          avatarUrl: item.avatarUrl,
          rating: item.rating,
          seatingCapacity: item.seatingCapacity,
        },
      });
      console.log(`  + Created theater: "${theater.name}" (${theater.city})`);
    }

    // Seed seats for this theater if they don't exist yet
    const seatCount = await prisma.seat.count({
      where: { theaterId: theater.id },
    });

    if (seatCount < theater.seatingCapacity) {
      const layout = generateSeatsLayout(theater.seatingCapacity);
      await prisma.seat.createMany({
        data: layout.map((seat) => ({
          theaterId: theater.id,
          rowName: seat.rowName,
          seatNumber: seat.seatNumber,
        })),
        skipDuplicates: true,
      });
      console.log(
        `    ↳ Generated ${layout.length} seats for "${theater.name}"`,
      );
    }

    seededTheaters.push(theater);
  }

  console.log(
    `🏛️ Successfully seeded ${seededTheaters.length} theaters with seats.`,
  );
  return seededTheaters;
}

if (require.main === module) {
  seedTheaters()
    .catch((err) => {
      console.error("❌ Failed to seed theaters:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
