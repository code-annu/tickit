import { prisma } from "@/config/prisma.client";
import { Prisma, SeatStatus } from "@/generated/prisma";

/**
 * Calculates seat price based on onwardsAmount and seat row position.
 * Price is guaranteed to be >= streaming.onwardsAmount.
 * - Front rows (A-C): base price (onwardsAmount)
 * - Middle rows (D-H): base price + 50
 * - Back/VIP rows (I+ / multi-letter rows): base price + 100
 */
function calculateSeatPrice(
  onwardsAmount: Prisma.Decimal,
  seatNumber: string,
): Prisma.Decimal {
  const rowMatch = seatNumber.match(/^([A-Z]+)/);
  const rowLabel = rowMatch ? rowMatch[1]! : "A";

  const basePrice = Number(onwardsAmount);
  let premium = 0;

  if (rowLabel >= "I" || rowLabel.length > 1) {
    premium = 100;
  } else if (rowLabel >= "D") {
    premium = 50;
  } else {
    premium = 0;
  }

  return new Prisma.Decimal(basePrice + premium);
}

interface SeatInventoryRecord {
  seatId: string;
  streamingId: string;
  status: SeatStatus;
  price: Prisma.Decimal;
}

const BATCH_SIZE = 5000;

async function seedTheaterSeatInventories() {
  console.log("🎫 Seeding theater seat inventory...");

  const [streamings, seats] = await Promise.all([
    prisma.streamingTheater.findMany(),
    prisma.theaterSeat.findMany(),
  ]);

  if (streamings.length === 0 || seats.length === 0) {
    console.error(
      "❌ No streamings or seats found. Run theater-seat & theater-streaming seeds first.",
    );
    process.exit(1);
  }

  console.log(
    `   Found ${streamings.length} streaming(s) and ${seats.length} total seat(s)`,
  );

  // Group seats by theaterId for quick lookup
  const seatsByTheaterMap = new Map<string, typeof seats>();
  for (const seat of seats) {
    const existing = seatsByTheaterMap.get(seat.theaterId) || [];
    existing.push(seat);
    seatsByTheaterMap.set(seat.theaterId, existing);
  }

  const streamingIds = streamings.map((s) => s.id);

  // Clear existing inventory entries to ensure idempotency
  const deleted = await prisma.theaterSeatInventory.deleteMany({
    where: { streamingId: { in: streamingIds } },
  });

  if (deleted.count > 0) {
    console.log(`  🗑️  Cleared ${deleted.count} existing seat inventory item(s)`);
  }

  const records: SeatInventoryRecord[] = [];

  for (const streaming of streamings) {
    const theaterSeats = seatsByTheaterMap.get(streaming.theaterId) || [];

    for (const seat of theaterSeats) {
      records.push({
        seatId: seat.id,
        streamingId: streaming.id,
        status: SeatStatus.AVAILABLE,
        price: calculateSeatPrice(streaming.onwardsAmount, seat.seatNumber),
      });
    }
  }

  console.log(`   Prepared ${records.length} seat inventory record(s) for insertion`);

  // Batch insert in chunks of BATCH_SIZE
  let insertedCount = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE);
    const result = await prisma.theaterSeatInventory.createMany({
      data: chunk,
    });
    insertedCount += result.count;
  }

  console.log(
    `🎫 Seeded ${insertedCount} seat inventory records across ${streamings.length} streaming(s) successfully!`,
  );
}

seedTheaterSeatInventories()
  .catch((error) => {
    console.error("❌ Theater seat inventory seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
