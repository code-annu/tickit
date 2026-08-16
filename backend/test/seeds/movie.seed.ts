import { prisma } from "@/core/prisma/prisma.client";
import movieData from "../data/movie.data.json";

export interface MovieData {
  title: string;
  posterUrl: string;
  releaseDate?: string;
  releasedDate?: string;
  overview: string;
  language: string;
  durationMin?: number;
}

export async function seedMovies() {
  console.log("🎬 Seeding movies...");
  const seededMovies = [];

  for (const item of movieData as MovieData[]) {
    const releaseDateStr = item.releaseDate || item.releasedDate || "2026-01-01";
    const releaseDate = new Date(releaseDateStr);
    const durationMin = item.durationMin ?? 120;

    const existing = await prisma.movie.findFirst({
      where: { title: item.title },
    });

    let movie;
    if (existing) {
      movie = await prisma.movie.update({
        where: { id: existing.id },
        data: {
          overview: item.overview,
          releaseDate,
          language: item.language,
          posterUrl: item.posterUrl,
          durationMin,
        },
      });
      console.log(`  ✓ Updated movie: "${movie.title}"`);
    } else {
      movie = await prisma.movie.create({
        data: {
          title: item.title,
          overview: item.overview,
          releaseDate,
          language: item.language,
          posterUrl: item.posterUrl,
          durationMin,
        },
      });
      console.log(`  + Created movie: "${movie.title}"`);
    }

    seededMovies.push(movie);
  }

  console.log(`🎬 Successfully seeded ${seededMovies.length} movies.`);
  return seededMovies;
}

if (require.main === module) {
  seedMovies()
    .catch((err) => {
      console.error("❌ Failed to seed movies:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
