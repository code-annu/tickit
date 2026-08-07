import request from "supertest";
import app from "@/app";
import { prisma } from "@/core/prisma/prisma.client";

describe("GET /api/theaters/:id", () => {
  let existingTheaterId: string;

  beforeAll(async () => {
    const theater = await prisma.theater.findFirst();
    if (!theater) throw new Error("No theaters in DB. Run seed:theater first.");
    existingTheaterId = theater.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 200 with theater details for a valid id", async () => {
    const response = await request(app).get(
      `/api/theaters/${existingTheaterId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Theater details fetched successfully",
    );
    expect(response.body.data).toHaveProperty("id", existingTheaterId);
  });

  it("should return theater with correct shape", async () => {
    const response = await request(app).get(
      `/api/theaters/${existingTheaterId}`,
    );

    expect(response.status).toBe(200);

    const theater = response.body.data;
    expect(theater).toHaveProperty("id");
    expect(theater).toHaveProperty("name");
    expect(theater).toHaveProperty("city");
    expect(theater).toHaveProperty("avatarUrl");
    expect(theater).toHaveProperty("address");
    expect(theater).toHaveProperty("rating");
    expect(theater).toHaveProperty("seatingCapacity");
  });

  it("should return 404 when theater does not exist", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const response = await request(app).get(
      `/api/theaters/${nonExistentId}`,
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "THEATER_NOT_FOUND");
    expect(response.body.error).toHaveProperty(
      "message",
      "Theater not found",
    );
  });

  it("should return 400 for an invalid UUID", async () => {
    const response = await request(app).get("/api/theaters/invalid-uuid");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "INVALID_REQUEST");
  });
});
