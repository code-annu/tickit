import request from "supertest";
import app from "@/app";
import { prisma } from "@/core/prisma/prisma.client";
import ShowErrorCode from "@/modules/show/ShowErrorCode";

describe("GET /api/shows/:id", () => {
  let existingShowId: string;

  beforeAll(async () => {
    const show = await prisma.show.findFirst();
    if (!show) throw new Error("No shows in DB. Run seed:all first.");
    existingShowId = show.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 200 with show details for a valid id", async () => {
    const response = await request(app).get(
      `/api/shows/${existingShowId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Show details fetched successfully");
    expect(response.body.data).toHaveProperty("id", existingShowId);
  });

  it("should return show with correct shape", async () => {
    const response = await request(app).get(
      `/api/shows/${existingShowId}`,
    );

    expect(response.status).toBe(200);

    const show = response.body.data;
    expect(show).toHaveProperty("id");
    expect(show).toHaveProperty("movie");
    expect(show.movie).toHaveProperty("id");
    expect(show.movie).toHaveProperty("title");
    expect(show.movie).toHaveProperty("posterUrl");
    expect(show).toHaveProperty("theater");
    expect(show.theater).toHaveProperty("id");
    expect(show.theater).toHaveProperty("name");
    expect(show.theater).toHaveProperty("address");
    expect(show).toHaveProperty("onDate");
    expect(show).toHaveProperty("startTime");
    expect(show).toHaveProperty("endTime");
    expect(show).toHaveProperty("duration");
    expect(show).toHaveProperty("onwardAmount");
  });

  it("should return 404 when show does not exist", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const response = await request(app).get(
      `/api/shows/${nonExistentId}`,
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty(
      "code",
      ShowErrorCode.SHOW_NOT_FOUND,
    );
    expect(response.body.error).toHaveProperty("message", "Show not found");
  });

  it("should return 400 for an invalid UUID", async () => {
    const response = await request(app).get("/api/shows/invalid-uuid");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "INVALID_REQUEST");
  });
});
