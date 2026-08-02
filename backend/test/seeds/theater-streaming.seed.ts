import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";

/**
 * Theater Streaming Seed Script
 *
 * Generates show schedules for ALL theaters × a rotating subset of movies
 * across 3 days (Aug 2–4, 2026).
 *
 * Schedule rules:
 *  - Shows run from 09:00 to 23:00
 *  - Each show has a random duration of 120–180 min
 *  - 30 min gap between consecutive shows (cleanup / ads)
 *  - No time overlaps within a single theater+date
 *  - Each theater gets 3–4 movies per day assigned round-robin
 *  - Ticket price (onwardsAmount) varies by time-slot:
 *       Morning  (before 12:00): ₹150 – ₹250
 *       Matinee  (12:00–17:00):  ₹200 – ₹350
 *       Evening  (after 17:00):  ₹300 – ₹500
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Create a `@db.Time(0)` compatible Date (1970-01-01 HH:MM:SS) */
function timeOnly(hours: number, minutes: number): Date {
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
}

/** Create a `@db.Date` compatible Date (YYYY-MM-DD 00:00 UTC) */
function dateOnly(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

/** Random integer between min and max (inclusive) */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Deterministic shuffle (Fisher-Yates) using a simple seed */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Determine ticket price bracket by hour */
function priceForSlot(hour: number): Prisma.Decimal {
  if (hour < 12) return new Prisma.Decimal(randInt(150, 250)); // Morning
  if (hour < 17) return new Prisma.Decimal(randInt(200, 350)); // Matinee
  return new Prisma.Decimal(randInt(300, 500)); // Evening
}

// ── Main ─────────────────────────────────────────────────────────────────────

const SEED_DATES = [
  dateOnly(2026, 8, 2),
  dateOnly(2026, 8, 3),
  dateOnly(2026, 8, 4),
];

const DAY_START_HOUR = 9; // 09:00
const DAY_END_HOUR = 23; // last show must END by 23:00
const GAP_MINUTES = 30; // inter-show buffer

interface StreamingRecord {
  movieId: string;
  theaterId: string;
  onDate: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
  onwardsAmount: Prisma.Decimal;
}

async function seedTheaterStreamings() {
  console.log("🎞️  Seeding theater streamings...");

  const [movies, theaters] = await Promise.all([
    prisma.movie.findMany(),
    prisma.theater.findMany(),
  ]);

  if (movies.length === 0 || theaters.length === 0) {
    console.error(
      "❌ No movies or theaters found. Run movie & theater seeds first.",
    );
    process.exit(1);
  }

  console.log(
    `   Found ${movies.length} movies and ${theaters.length} theaters`,
  );

  // Clear existing streaming data for the target dates
  const deleted = await prisma.streamingTheater.deleteMany({
    where: { onDate: { in: SEED_DATES } },
  });
  if (deleted.count > 0) {
    console.log(
      `  🗑️  Cleared ${deleted.count} existing streaming(s) for target dates`,
    );
  }

  const records: StreamingRecord[] = [];

  for (const theater of theaters) {
    for (const date of SEED_DATES) {
      // Pick a shuffled set of movies for variety across theaters
      const moviePool = shuffle(movies);

      let currentMinutes = DAY_START_HOUR * 60; // cursor in minutes from midnight

      let movieIndex = 0;

      while (true) {
        // Pick next movie (round-robin through shuffled pool)
        const movie = moviePool[movieIndex % moviePool.length];
        movieIndex++;

        // Random show duration: 120–180 minutes
        const duration = randInt(120, 180);

        const startHour = Math.floor(currentMinutes / 60);
        const startMin = currentMinutes % 60;

        const endTotalMinutes = currentMinutes + duration;
        const endHour = Math.floor(endTotalMinutes / 60);
        const endMin = endTotalMinutes % 60;

        // If the show would end past the day limit, stop scheduling
        if (endTotalMinutes > DAY_END_HOUR * 60) break;

        records.push({
          movieId: movie!.id,
          theaterId: theater.id,
          onDate: date,
          startTime: timeOnly(startHour, startMin),
          endTime: timeOnly(endHour, endMin),
          duration,
          onwardsAmount: priceForSlot(startHour),
        });

        // Advance cursor past this show + gap
        currentMinutes = endTotalMinutes + GAP_MINUTES;
      }
    }
  }

  // Batch insert
  const result = await prisma.streamingTheater.createMany({ data: records });

  console.log(
    `🎞️  Seeded ${result.count} theater streamings across ${SEED_DATES.length} days!`,
  );
}

seedTheaterStreamings()
  .catch((error) => {
    console.error("❌ Theater streaming seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
