import app from "@/app";
import request from "supertest";
import crypto from "crypto";
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

describe("GET /api/shows/:id", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 200 with full show details when show exists", async () => {
      const theater = await TheaterFactory.createTheater({
        address: "123 Cinema Street",
      });
      const movie = await MovieFactory.createMovie({
        title: "Inception",
      });
      const show = await ShowFactory.createShow(movie.id, theater.id, {
        onDate: new Date("2026-08-15"),
        startTime: new Date(Date.UTC(1970, 0, 1, 10, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 12, 30, 0)),
        basePrice: 250,
      });

      const res = await request(app).get(`${API}/${show.id}`).expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toMatchObject({
        id: show.id,
        basePrice: 250,
        movie: { id: movie.id, title: "Inception" },
        theater: { id: theater.id, address: "123 Cinema Street" },
      });
    });
  });

  // ─── Not Found (404) ───────────────────────────────────────
  describe("Not Found", () => {
    it("should return 404 with SHOW_NOT_FOUND when show does not exist", async () => {
      const nonExistentId = crypto.randomUUID();

      const res = await request(app)
        .get(`${API}/${nonExistentId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(ShowErrorCode.SHOW_NOT_FOUND);
    });
  });

  // ─── Validation errors (400) ──────────────────────────────
  describe("Validation", () => {
    it("should return 400 when id is not a valid UUID", async () => {
      const res = await request(app).get(`${API}/invalid-uuid-123`).expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
      expect(res.body.error.message).toBe("Missing or invalid path parameters");
    });

    it("should return 400 when id is numeric instead of UUID", async () => {
      const res = await request(app).get(`${API}/12345`).expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });
  });
});
