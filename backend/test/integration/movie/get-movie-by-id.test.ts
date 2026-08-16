import app from "@/app";
import request from "supertest";
import crypto from "crypto";
import { resetDb } from "../../helpers/cleanup";
import MovieFactory from "../../factories/movie.factory";
import MovieErrorCode from "@/modules/movie/error/MovieErrorCode";
import AppErrorCode from "@/core/error/AppErrorCode";

const API = "/api/movies";

beforeEach(async () => {
  await resetDb();
});

describe("GET /api/movies/:id", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 200 with full movie details when movie exists", async () => {
      const created = await MovieFactory.createMovie({
        title: "Spider-Man: Brand New Day",
        overview: "Peter Parker navigates a whole new chapter.",
        durationMin: 135,
        language: "English",
        posterUrl: "https://example.com/spiderman.jpg",
      });

      const res = await request(app).get(`${API}/${created.id}`).expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toMatchObject({
        id: created.id,
        title: created.title,
        overview: created.overview,
        durationMin: created.durationMin,
        language: created.language,
        posterUrl: created.posterUrl,
      });
      expect(res.body.data).toHaveProperty("releaseDate");
    });
  });

  // ─── Not Found (404) ───────────────────────────────────────
  describe("Not Found", () => {
    it("should return 404 with MOVIE_NOT_FOUND when movie does not exist", async () => {
      const nonExistentId = crypto.randomUUID();

      const res = await request(app)
        .get(`${API}/${nonExistentId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(MovieErrorCode.MOVIE_NOT_FOUND);
      expect(res.body.error.message).toBe("Movie not found");
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
