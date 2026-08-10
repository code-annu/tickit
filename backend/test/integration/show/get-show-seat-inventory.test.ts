import request from "supertest";
import app from "@/app";
import { prisma } from "@/core/prisma/prisma.client";
import AuthHelper from "../../helpers/auth.helper";
import ShowErrorCode from "@/modules/show/ShowErrorCode";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

describe("GET /api/shows/:id/seats", () => {
  let existingShowId: string;
  let accessToken: string;

  beforeAll(async () => {
    const show = await prisma.show.findFirst();
    if (!show) throw new Error("No shows in DB. Run seed:all first.");
    existingShowId = show.id;

    const { authUser } = await AuthHelper.getAuthenticatedUser();
    accessToken = authUser.session.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 200 with seat inventory when authenticated", async () => {
    const response = await request(app)
      .get(`/api/shows/${existingShowId}/seats`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Show seat inventory fetched successfully",
    );
    expect(response.body.data).toHaveProperty("showId", existingShowId);
    expect(response.body.data).toHaveProperty("seats");
    expect(response.body.data).toHaveProperty("totalSeats");
    expect(response.body.data).toHaveProperty("availableSeats");
    expect(response.body.data).toHaveProperty("bookedSeats");
    expect(response.body.data).toHaveProperty("heldSeats");
    expect(Array.isArray(response.body.data.seats)).toBe(true);
  });

  it("should return seat objects with correct shape", async () => {
    const response = await request(app)
      .get(`/api/shows/${existingShowId}/seats`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    const seats = response.body.data.seats;
    if (seats.length > 0) {
      const seat = seats[0];
      expect(seat).toHaveProperty("id");
      expect(seat).toHaveProperty("rowName");
      expect(seat).toHaveProperty("seatNumber");
      expect(seat).toHaveProperty("status");
      expect(seat).toHaveProperty("price");
    }
  });

  it("should return 401 when Authorization header is missing", async () => {
    const response = await request(app).get(
      `/api/shows/${existingShowId}/seats`,
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty(
      "code",
      AuthErrorCode.MISSING_ACCESS_TOKEN,
    );
  });

  it("should return 401 when access token is invalid", async () => {
    const response = await request(app)
      .get(`/api/shows/${existingShowId}/seats`)
      .set("Authorization", "Bearer invalid_token");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty(
      "code",
      AuthErrorCode.INVALID_ACCESS_TOKEN,
    );
  });

  it("should return 404 when show does not exist", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const response = await request(app)
      .get(`/api/shows/${nonExistentId}/seats`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty(
      "code",
      ShowErrorCode.SHOW_NOT_FOUND,
    );
  });

  it("should return 400 for an invalid UUID", async () => {
    const response = await request(app)
      .get("/api/shows/invalid-uuid/seats")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "INVALID_REQUEST");
  });
});
