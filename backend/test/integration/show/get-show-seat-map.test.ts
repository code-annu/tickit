import app from "@/app";
import request from "supertest";
import crypto from "crypto";
import { prisma } from "@/core/prisma/prisma.client";
import { resetDb } from "../../helpers/cleanup";
import TheaterFactory from "../../factories/theater.factory";
import MovieFactory from "../../factories/movie.factory";
import ShowFactory from "../../factories/show.factory";
import ShowErrorCode from "@/modules/show/error/ShowErrorCode";
import AppErrorCode from "@/core/error/AppErrorCode";

const API = "/api/shows";

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

describe("GET /api/shows/:id/seat-map", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 200 with seat inventory for a valid show", async () => {
      const theater = await TheaterFactory.createTheater();
      const movie = await MovieFactory.createMovie();
      const show = await ShowFactory.createShow(movie.id, theater.id);

      const { showSeat: ss1 } = await createSeatWithShowSeat(
        theater.id,
        show.id,
        { rowName: "A", seatNumber: 1, price: 250, status: "AVAILABLE" },
      );
      const { showSeat: ss2 } = await createSeatWithShowSeat(
        theater.id,
        show.id,
        { rowName: "A", seatNumber: 2, price: 250, status: "HELD" },
      );
      const { showSeat: ss3 } = await createSeatWithShowSeat(
        theater.id,
        show.id,
        { rowName: "B", seatNumber: 1, price: 300, status: "BOOKED" },
      );

      const res = await request(app)
        .get(`${API}/${show.id}/seat-map`)
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data.showId).toBe(show.id);
      expect(res.body.data.seats).toHaveLength(3);

      const seatIds = res.body.data.seats.map((s: any) => s.id);
      expect(seatIds).toContain(ss1.id);
      expect(seatIds).toContain(ss2.id);
      expect(seatIds).toContain(ss3.id);

      const seatA1 = res.body.data.seats.find((s: any) => s.id === ss1.id);
      expect(seatA1).toMatchObject({
        rowName: "A",
        seatNumber: 1,
        status: "AVAILABLE",
        price: 250,
      });

      const seatA2 = res.body.data.seats.find((s: any) => s.id === ss2.id);
      expect(seatA2).toMatchObject({
        status: "HELD",
      });

      const seatB1 = res.body.data.seats.find((s: any) => s.id === ss3.id);
      expect(seatB1).toMatchObject({
        status: "BOOKED",
        price: 300,
      });
    });

    it("should return empty seats array when show has no seats", async () => {
      const theater = await TheaterFactory.createTheater();
      const movie = await MovieFactory.createMovie();
      const show = await ShowFactory.createShow(movie.id, theater.id);

      const res = await request(app)
        .get(`${API}/${show.id}/seat-map`)
        .expect(200);

      expect(res.body.data.showId).toBe(show.id);
      expect(res.body.data.seats).toEqual([]);
    });
  });

  // ─── Not Found (404) ───────────────────────────────────────
  describe("Not Found", () => {
    it("should return 404 with SHOW_NOT_FOUND when show does not exist", async () => {
      const nonExistentId = crypto.randomUUID();

      const res = await request(app)
        .get(`${API}/${nonExistentId}/seat-map`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(ShowErrorCode.SHOW_NOT_FOUND);
    });
  });

  // ─── Validation errors (400) ──────────────────────────────
  describe("Validation", () => {
    it("should return 400 when id is not a valid UUID", async () => {
      const res = await request(app)
        .get(`${API}/not-a-uuid/seat-map`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
      expect(res.body.error.message).toBe("Missing or invalid path parameters");
    });

    it("should return 400 when id is numeric instead of UUID", async () => {
      const res = await request(app)
        .get(`${API}/12345/seat-map`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });
  });
});
