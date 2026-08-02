import { prisma } from "@/config/prisma.client";
import { readFileSync } from "fs";
import { join } from "path";

interface MovieData {
  title: string;
  posterUrl: string;
  releasedDate: string;
  overview: string;
  language: string;
}

const dataPath = join(__dirname, "..", "data", "movie.data.json");
const rawMovies: MovieData[] = JSON.parse(readFileSync(dataPath, "utf-8"));

// Convert date strings to Date objects for Prisma
const movies = rawMovies.map((m) => ({
  ...m,
  releasedDate: new Date(m.releasedDate),
}));

async function seedMovies() {
  console.log("🎬 Seeding movies...");

  const titles = movies.map((m) => m.title);

  // Remove previously seeded entries (if any) to keep the script idempotent
  const deleted = await prisma.movie.deleteMany({
    where: { title: { in: titles } },
  });

  if (deleted.count > 0) {
    console.log(`  🗑️  Cleared ${deleted.count} existing movie(s)`);
  }

  const result = await prisma.movie.createMany({ data: movies });

  console.log(`🎬 Seeded ${result.count} movies successfully!`);
}

seedMovies()
  .catch((error) => {
    console.error("❌ Movie seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
