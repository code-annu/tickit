import { prisma } from "@/core/prisma/prisma.client";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const SEATS_PER_ROW = 10;

async function seedTheaterSeats() {
  console.log("💺 Seeding theater seats...");

  const theaters = await prisma.theater.findMany();
  if (theaters.length === 0) {
    console.error("❌ No theaters found. Run theater seed first.");
    process.exit(1);
  }

  const theaterIds = theaters.map((t) => t.id);

  // Remove previously seeded entries to keep the script idempotent
  const deleted = await prisma.theaterSeat.deleteMany({
    where: { theaterId: { in: theaterIds } },
  });

  if (deleted.count > 0) {
    console.log(`  🗑️  Cleared ${deleted.count} existing theater seat(s)`);
  }

  const seatsToCreate: {
    theaterId: string;
    rowName: string;
    seatNumber: number;
  }[] = [];

  for (const theater of theaters) {
    for (const rowName of ROWS) {
      for (let seatNumber = 1; seatNumber <= SEATS_PER_ROW; seatNumber++) {
        seatsToCreate.push({
          theaterId: theater.id,
          rowName,
          seatNumber,
        });
      }
    }
  }

  const result = await prisma.theaterSeat.createMany({
    data: seatsToCreate,
    skipDuplicates: true,
  });

  console.log(
    `💺 Seeded ${result.count} theater seats across ${theaters.length} theaters successfully!`,
  );
}

seedTheaterSeats()
  .catch((error) => {
    console.error("❌ Theater seats seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
