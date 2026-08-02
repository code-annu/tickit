import { prisma } from "@/config/prisma.client";
import { readFileSync } from "fs";
import { join } from "path";

interface TheaterData {
  name: string;
  city: string;
  address: string;
  avatarUrl: string;
  rating: number;
  seatingCapacity: number;
}

const dataPath = join(__dirname, "..", "data", "theater.data.json");
const theaters: TheaterData[] = JSON.parse(readFileSync(dataPath, "utf-8"));

async function seedTheaters() {
  console.log("🎭 Seeding theaters...");

  const names = theaters.map((t) => t.name);

  // Remove previously seeded entries (if any) to keep the script idempotent
  const deleted = await prisma.theater.deleteMany({
    where: { name: { in: names } },
  });

  if (deleted.count > 0) {
    console.log(`  🗑️  Cleared ${deleted.count} existing theater(s)`);
  }

  const result = await prisma.theater.createMany({ data: theaters });

  console.log(`🎭 Seeded ${result.count} theaters successfully!`);
}

seedTheaters()
  .catch((error) => {
    console.error("❌ Theater seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
