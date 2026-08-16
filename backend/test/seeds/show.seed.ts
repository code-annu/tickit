import { prisma } from "@/core/prisma/prisma.client";
import { SeatStatus } from "@/generated/prisma/client";
import { seedMovies } from "./movie.seed";
import { seedTheaters } from "./theater.seed";

interface TimeSlot {
  startHour: number;
  startMinute: number;
  label: string;
}

// 4 distinct, non-overlapping daily time slots with built-in buffers
const DAILY_TIME_SLOTS: TimeSlot[] = [
  { startHour: 9, startMinute: 30, label: "Morning Show" }, // 09:30 - ~12:15
  { startHour: 13, startMinute: 15, label: "Matinee Show" }, // 13:15 - ~16:00
  { startHour: 17, startMinute: 0, label: "Evening Show" }, // 17:00 - ~19:45
  { startHour: 20, startMinute: 45, label: "Night Show" }, // 20:45 - ~23:30
];

/**
 * Build a UTC Date for onDate (midnight)
 */
function createOnDate(baseDate: Date, dayOffset: number): Date {
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/**
 * Build a Date representing a time-of-day for Prisma @db.Time()
 */
function createTime(hour: number, minute: number): Date {
  return new Date(Date.UTC(1970, 0, 1, hour, minute, 0, 0));
}

/**
 * Calculate endTime based on startTime and duration in minutes
 */
function calculateEndTime(startTime: Date, durationMin: number): Date {
  return new Date(startTime.getTime() + durationMin * 60 * 1000);
}

/**
 * Calculate dynamic show base price depending on slot, day, and theater rating
 */
function calculateBasePrice(
  slotIndex: number,
  theaterRating: number,
  isWeekend: boolean,
): number {
  let base = 200;
  if (slotIndex === 2) base += 50; // Evening
  if (slotIndex === 3) base += 80; // Night
  if (isWeekend) base += 40; // Weekend
  if (theaterRating >= 4.5) base += 30; // Premium theater
  return base;
}

export async function seedShows(daysToSeed = 3) {
  console.log("🎟️ Seeding shows and show-seats...");

  // 1. Ensure movies and theaters exist
  let movies = await prisma.movie.findMany();
  if (movies.length === 0) {
    console.log("  ↳ No movies found, seeding movies first...");
    movies = await seedMovies();
  }

  let theaters = await prisma.theater.findMany({
    include: { seats: true },
  });
  if (theaters.length === 0 || theaters.some((t) => t.seats.length === 0)) {
    console.log("  ↳ No theaters or seats found, seeding theaters first...");
    await seedTheaters();
    theaters = await prisma.theater.findMany({
      include: { seats: true },
    });
  }

  const today = new Date();
  let totalShowsCreated = 0;
  let totalShowSeatsCreated = 0;

  // Process theaters in batches for high throughput
  for (const theater of theaters) {
    const seats = theater.seats;
    if (seats.length === 0) continue;

    const tIndex = theaters.indexOf(theater);

    for (let dayOffset = 0; dayOffset < daysToSeed; dayOffset++) {
      const onDate = createOnDate(today, dayOffset);
      const dayOfWeek = onDate.getUTCDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Assign 2 distinct movies per theater per day:
      // Movie 1 gets Slot 0 (09:30) and Slot 2 (17:00) -> multiple shows same day
      // Movie 2 gets Slot 1 (13:15) and Slot 3 (20:45) -> multiple shows same day
      const primaryMovieIndex = (tIndex + dayOffset) % movies.length;
      const secondaryMovieIndex = (tIndex + dayOffset + 1) % movies.length;

      const primaryMovie = movies[primaryMovieIndex];
      const secondaryMovie = movies[secondaryMovieIndex];

      const slotAssignments = [
        { slot: DAILY_TIME_SLOTS[0], movie: primaryMovie, index: 0 },
        { slot: DAILY_TIME_SLOTS[1], movie: secondaryMovie, index: 1 },
        { slot: DAILY_TIME_SLOTS[2], movie: primaryMovie, index: 2 },
        { slot: DAILY_TIME_SLOTS[3], movie: secondaryMovie, index: 3 },
      ];

      for (const { slot, movie, index } of slotAssignments) {
        const startTime = createTime(slot!.startHour, slot!.startMinute);
        const endTime = calculateEndTime(startTime, movie!.durationMin);
        const basePrice = calculateBasePrice(index, theater.rating, isWeekend);

        // Smart check: avoid duplicate show if already present
        const existingShow = await prisma.show.findFirst({
          where: {
            theaterId: theater.id,
            onDate,
            startTime,
          },
        });

        if (!existingShow) {
          const newShow = await prisma.show.create({
            data: {
              movieId: movie!.id,
              theaterId: theater.id,
              onDate,
              startTime,
              endTime,
              basePrice,
            },
          });
          totalShowsCreated++;

          // Bulk insert show seats for every seat in the theater
          const showSeatsData = seats.map((seat) => ({
            seatId: seat.id,
            showId: newShow.id,
            price: basePrice,
            status: SeatStatus.AVAILABLE,
          }));

          const result = await prisma.showSeat.createMany({
            data: showSeatsData,
            skipDuplicates: true,
          });

          totalShowSeatsCreated += result.count;
        }
      }
    }
  }

  console.log(
    `🎟️ Show seeding completed! Created: ${totalShowsCreated} new shows, ${totalShowSeatsCreated} show-seats across ${daysToSeed} days.`,
  );
}

if (require.main === module) {
  seedShows()
    .catch((err) => {
      console.error("❌ Failed to seed shows:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
