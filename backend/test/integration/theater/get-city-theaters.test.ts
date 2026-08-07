import request from "supertest";
import app from "@/app";
import { prisma } from "@/core/prisma/prisma.client";

describe("GET /api/theaters", () => {
  let existingCity: string;

  beforeAll(async () => {
    const theater = await prisma.theater.findFirst();
    if (!theater) throw new Error("No theaters in DB. Run seed:theater first.");
    existingCity = theater.city;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 200 with a list of theaters for a valid city", async () => {
    const response = await request(app)
      .get("/api/theaters")
      .query({ city: existingCity });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Theaters fetched successfully");
    expect(response.body.data).toHaveProperty("theaters");
    expect(response.body.data).toHaveProperty("totalTheaters");
    expect(Array.isArray(response.body.data.theaters)).toBe(true);
  });

  it("should return theaters with correct shape", async () => {
    const response = await request(app)
      .get("/api/theaters")
      .query({ city: existingCity });

    expect(response.status).toBe(200);

    const theaters = response.body.data.theaters;
    expect(theaters.length).toBeGreaterThan(0);

    const theater = theaters[0];
    expect(theater).toHaveProperty("id");
    expect(theater).toHaveProperty("name");
    expect(theater).toHaveProperty("city");
    expect(theater).toHaveProperty("avatarUrl");
    expect(theater).toHaveProperty("address");
    expect(theater).toHaveProperty("rating");
    expect(theater).toHaveProperty("seatingCapacity");
  });

  it("should return totalTheaters matching the theaters array length", async () => {
    const response = await request(app)
      .get("/api/theaters")
      .query({ city: existingCity });

    expect(response.status).toBe(200);

    const { theaters, totalTheaters } = response.body.data;
    expect(totalTheaters).toBe(theaters.length);
  });

  it("should return empty list for a city with no theaters", async () => {
    const response = await request(app)
      .get("/api/theaters")
      .query({ city: "NonExistentCity" });

    expect(response.status).toBe(200);
    expect(response.body.data.theaters).toEqual([]);
    expect(response.body.data.totalTheaters).toBe(0);
  });

  it("should return 400 when city query param is missing", async () => {
    const response = await request(app).get("/api/theaters");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "INVALID_REQUEST");
  });
});
