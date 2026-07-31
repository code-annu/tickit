import { prisma } from "@/config/prisma.client";

const movies = [
  {
    title: "Pushpa: The Rise",
    posterUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3I84wCRTf0lEnJBcXKdTnHGsKUUtptPZOKjar3x9F97SbbdInBh6oQ6j9eFo6c361C5iM&s=10",
    releasedDate: new Date("2021-12-17"),
    overview:
      "A daily wage laborer rises through the ranks of a powerful red sandalwood smuggling syndicate in the forests of Andhra Pradesh, challenging rivals and corrupt authorities while carving out his own empire.",
    language: "Telugu",
  },
  {
    title: "Toxic",
    posterUrl:
      "https://cdn.district.in/movies-assets/images/cinema/98-e1e60ac0-1d43-11f1-9a5c-6f32de6382cf.jpg",
    releasedDate: new Date("2026-03-19"),
    overview:
      "A gritty period gangster drama following the rise of a feared underworld figure whose choices blur the line between power, loyalty, and survival in a violent criminal world.",
    language: "Kannada",
  },
  {
    title: "The Odyssey",
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/9/90/The_Odyssey_%282026_film%29_poster.jpg/250px-The_Odyssey_%282026_film%29_poster.jpg",
    releasedDate: new Date("2026-07-17"),
    overview:
      "An epic retelling of Homer's classic tale, following Odysseus on his perilous journey home after the Trojan War, facing mythical creatures, divine intervention, and impossible trials.",
    language: "English",
  },
  {
    title: "Spider-Man: Brand New Day",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BOWNjYWM3NWItOGE0ZS00MWRjLThiZWEtYjc4ZmNmMmU5ZTVmXkEyXkFqcGc@._V1_.jpg",
    releasedDate: new Date("2026-07-31"),
    overview:
      "With the world having forgotten Peter Parker, Spider-Man faces new threats alone while adapting to a life without his former friends, discovering unexpected challenges that test both the hero and the man behind the mask.",
    language: "English",
  },
  {
    title: "Welcome to the Jungle",
    posterUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT50UB3VCarAC-cfdPPzatDhXHvAsXoiQyS9Up7mMI3mM8d_6nccnfnPfw&s=10",
    releasedDate: new Date("2026-06-26"),
    overview:
      "A chaotic action-comedy where a team of eccentric characters embarks on a dangerous adventure packed with mistaken identities, explosive action, and hilarious misadventures.",
    language: "Hindi",
  },
];

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
