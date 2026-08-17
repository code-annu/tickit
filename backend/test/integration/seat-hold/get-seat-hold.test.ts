import app from "@/app";
import request from "supertest";
import crypto from "crypto";
import { prisma } from "@/core/prisma/prisma.client";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import TheaterFactory from "../../factories/theater.factory";
import MovieFactory from "../../factories/movie.factory";
import ShowFactory from "../../factories/show.factory";
import SeatHoldErrorCode from "@/modules/seat-hold/error/SeatHoldErrorCode";
import AppErrorCode from "@/core/error/AppErrorCode";
import AuthErrorCode from "@/modules/auth/error/AuthErrorCode";

const API = "/api/seat-hold";

beforeEach(async () => {
  await resetDb();
});

// ---------------------------------------------------------------------------
// Helper: create a Seat + ShowSeat in one call
// ---------------------------------------------------------------------------
async function createSeatWithShowSeat(
  theaterId: string,
  showId: string,
  opts: {
    rowName: string;
    seatNumber: number;
    price: number;
    status?: "AVAILABLE" | "HELD" | "BOOKED";
  },
) {
  const seat = await prisma.seat.create({
    data: {
      theaterId,
      rowName: opts.rowName,
      seatNumber: opts.seatNumber,
    },
  });

  const showSeat = await prisma.showSeat.create({
    data: {
      seatId: seat.id,
      showId,
      price: opts.price,
      status: opts.status ?? "AVAILABLE",
    },
  });

  return { seat, showSeat };
}

// ---------------------------------------------------------------------------
// Helper: create a seat hold via the API
// ---------------------------------------------------------------------------
async function createSeatHoldViaApi(
  accessToken: string,
  showId: string,
  showSeatIds: string[],
) {
  return request(app)
    .post(API)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ showId, showSeatIds });
}

describe("GET /api/seat-hold/:id", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 200 with the seat hold details when hold exists", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken } = authUser.session;

      const theater = await TheaterFactory.createTheater();
      const movie = await MovieFactory.createMovie();
      const show = await ShowFactory.createShow(movie.id, theater.id);

      const { showSeat: ss1 } = await createSeatWithShowSeat(
        theater.id,
        show.id,
        { rowName: "A", seatNumber: 1, price: 250, status: "AVAILABLE" },
      );

      // Create a hold first
      const holdRes = await createSeatHoldViaApi(accessToken, show.id, [
        ss1.id,
      ]);
      const holdId = holdRes.body.data.id;

      // Fetch it
      const res = await request(app)
        .get(`${API}/${holdId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data.id).toBe(holdId);
      expect(res.body.data.showId).toBe(show.id);
      expect(res.body.data.status).toBe("ACTIVE");
      expect(res.body.data.expiresAt).toBeDefined();
    });
  });

  // ─── Authentication (401) ─────────────────────────────────
  describe("Authentication", () => {
    it("should return 401 when no Authorization header is provided", async () => {
      const holdId = crypto.randomUUID();

      const res = await request(app)
        .get(`${API}/${holdId}`)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
    });
  });

  // ─── Not Found (404) ───────────────────────────────────────
  describe("Not Found", () => {
    it("should return 404 with SEAT_HOLD_NOT_FOUND when hold does not exist", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken } = authUser.session;
      const nonExistentId = crypto.randomUUID();

      const res = await request(app)
        .get(`${API}/${nonExistentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(SeatHoldErrorCode.SEAT_HOLD_NOT_FOUND);
    });
  });

  // ─── Validation errors (400) ──────────────────────────────
  describe("Validation", () => {
    it("should return 400 when id is not a valid UUID", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken } = authUser.session;

      const res = await request(app)
        .get(`${API}/invalid-uuid-123`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
      expect(res.body.error.message).toBe("Missing or invalid path parameters");
    });

    it("should return 400 when id is numeric instead of UUID", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken } = authUser.session;

      const res = await request(app)
        .get(`${API}/12345`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });
  });
});
