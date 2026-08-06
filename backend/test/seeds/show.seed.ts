import { prisma } from "@/core/prisma/prisma.client";
import { addDays, addMinutes, startOfDay, setHours, setMinutes } from "date-fns";

// Show slot templates — times when shows typically run in a theater
const SHOW_SLOTS = [
  { hour: 9, minute: 30, label: "Morning" },
  { hour: 12, minute: 30, label: "Matinee" },
  { hour: 15, minute: 45, label: "Afternoon" },
  { hour: 18, minute: 30, label: "Evening" },
  { hour: 21, minute: 15, label: "Night" },
];

// Duration range in minutes
const DURATIONS = [120, 135, 150, 165, 180];

// Base prices (₹) — varies per slot
const BASE_PRICES: Record<string, number> = {
  Morning: 150,
  Matinee: 200,
  Afternoon: 200,
  Evening: 250,
  Night: 300,
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomPriceVariation(base: number): number {
  // ±20% variation
  const variation = base * 0.2;
  return Math.round(base + (Math.random() * variation * 2 - variation));
}

async function seedShows() {
  console.log("🎥 Seeding shows...");

  const movies = await prisma.movie.findMany();
  const theaters = await prisma.theater.findMany();

  if (movies.length === 0) {
    console.error("❌ No movies found. Run movie seed first.");
    process.exit(1);
  }
  if (theaters.length === 0) {
    console.error("❌ No theaters found. Run theater seed first.");
    process.exit(1);
  }

  // Current date as the starting point
  const today = startOfDay(new Date());
  const days = [today, addDays(today, 1), addDays(today, 2)];

  console.log(
    `  📅 Generating shows for ${days.length} days: ${days.map((d) => d.toISOString().slice(0, 10)).join(", ")}`,
  );

  const showsToCreate: {
    movieId: string;
    theaterId: string;
    onDate: Date;
    startTime: Date;
    endTime: Date;
    duration: number;
    onwardAmount: number;
  }[] = [];

  for (const day of days) {
    for (const theater of theaters) {
      // Each theater runs 3-5 shows per day (randomly pick slots)
      const shuffledSlots = [...SHOW_SLOTS].sort(() => Math.random() - 0.5);
      const slotsForDay = shuffledSlots.slice(
        0,
        3 + Math.floor(Math.random() * 3), // 3 to 5 slots
      );

      for (const slot of slotsForDay) {
        const movie = pickRandom(movies);
        const duration = pickRandom(DURATIONS);

        const startTime = setMinutes(setHours(day, slot.hour), slot.minute);
        const endTime = addMinutes(startTime, duration);
        const onwardAmount = randomPriceVariation(BASE_PRICES[slot.label]!);

        showsToCreate.push({
          movieId: movie.id,
          theaterId: theater.id,
          onDate: day,
          startTime,
          endTime,
          duration,
          onwardAmount,
        });
      }
    }
  }

  // Clear existing shows for these dates to keep script idempotent
  const deleted = await prisma.show.deleteMany({
    where: {
      onDate: { in: days },
    },
  });

  if (deleted.count > 0) {
    console.log(`  🗑️  Cleared ${deleted.count} existing show(s)`);
  }

  const result = await prisma.show.createMany({ data: showsToCreate });

  console.log(`🎥 Seeded ${result.count} shows across ${theaters.length} theaters successfully!`);
}

seedShows()
  .catch((error) => {
    console.error("❌ Show seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
