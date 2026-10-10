import z from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters long"),
  DATABASE_URL: z.url(),
});
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment configuration:");
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = Object.freeze(result.data);

export type Env = z.infer<typeof envSchema>;
