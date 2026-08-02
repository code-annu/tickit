import { prisma } from "@/config/prisma.client";

const SEATS_PER_ROW = 10;

/**
 * Converts a 0-indexed row number to standard row label (A, B, ..., Z, AA, AB...)
 */
function getRowLabel(rowIndex: number): string {
  let label = "";
  let index = rowIndex;
  while (index >= 0) {
    label = String.fromCharCode(65 + (index % 26)) + label;
    index = Math.floor(index / 26) - 1;
  }
  return label;
}

interface SeatRecord {
  theaterId: string;
  seatNumber: string;
}

async function seedTheaterSeats() {
  console.log("🪑 Seeding theater seats...");

  const theaters = await prisma.theater.findMany();

  if (theaters.length === 0) {
    console.error("❌ No theaters found. Run theater seed first.");
    process.exit(1);
  }

  console.log(`   Found ${theaters.length} theater(s)`);

  const theaterIds = theaters.map((t) => t.id);

  // Clear existing seat entries to keep script idempotent
  const deleted = await prisma.theaterSeat.deleteMany({
    where: { theaterId: { in: theaterIds } },
  });

  if (deleted.count > 0) {
    console.log(`  🗑️  Cleared ${deleted.count} existing seat(s)`);
  }

  const seatsToCreate: SeatRecord[] = [];

  for (const theater of theaters) {
    for (let i = 0; i < theater.seatingCapacity; i++) {
      const rowIndex = Math.floor(i / SEATS_PER_ROW);
      const seatInRow = (i % SEATS_PER_ROW) + 1;
      const seatNumber = `${getRowLabel(rowIndex)}${seatInRow}`;

      seatsToCreate.push({
        theaterId: theater.id,
        seatNumber,
      });
    }
  }

  // Batch insert seats
  const result = await prisma.theaterSeat.createMany({
    data: seatsToCreate,
  });

  console.log(
    `🪑 Seeded ${result.count} seats across ${theaters.length} theater(s) successfully!`,
  );
}

seedTheaterSeats()
  .catch((error) => {
    console.error("❌ Theater seat seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
