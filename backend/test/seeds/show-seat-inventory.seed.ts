import { prisma } from "@/core/prisma/prisma.client";
import { SeatStatus } from "@/generated/prisma";

function calculateSeatPrice(basePrice: number, rowName: string): number {
  // Premium pricing for VIP back rows (H, I, J)
  if (["H", "I", "J"].includes(rowName)) {
    return Math.round(basePrice * 1.25);
  }
  return basePrice;
}

async function seedShowSeatInventory() {
  console.log("🎟️  Seeding show seat inventory...");

  const shows = await prisma.show.findMany({
    include: {
      theater: {
        include: {
          seats: true,
        },
      },
    },
  });

  if (shows.length === 0) {
    console.error("❌ No shows found. Run show seed first.");
    process.exit(1);
  }

  const showIds = shows.map((s) => s.id);

  // Remove previously seeded entries to keep script idempotent
  const deleted = await prisma.showSeat.deleteMany({
    where: { showId: { in: showIds } },
  });

  if (deleted.count > 0) {
    console.log(`  🗑️  Cleared ${deleted.count} existing show seat(s)`);
  }

  const showSeatsToCreate: {
    showId: string;
    seatId: string;
    status: SeatStatus;
    price: number;
  }[] = [];

  for (const show of shows) {
    const basePrice = show.onwardAmount.toNumber();
    const theaterSeats = show.theater.seats;

    for (const seat of theaterSeats) {
      showSeatsToCreate.push({
        showId: show.id,
        seatId: seat.id,
        status: SeatStatus.AVAILABLE,
        price: calculateSeatPrice(basePrice, seat.rowName),
      });
    }
  }

  // Insert in batches of 5000 to keep DB payload size clean and optimal
  const BATCH_SIZE = 5000;
  let totalCreated = 0;

  for (let i = 0; i < showSeatsToCreate.length; i += BATCH_SIZE) {
    const batch = showSeatsToCreate.slice(i, i + BATCH_SIZE);
    const result = await prisma.showSeat.createMany({
      data: batch,
      skipDuplicates: true,
    });
    totalCreated += result.count;
  }

  console.log(
    `🎟️  Seeded ${totalCreated} show seats across ${shows.length} shows successfully!`,
  );
}

seedShowSeatInventory()
  .catch((error) => {
    console.error("❌ Show seat inventory seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
