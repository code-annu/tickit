import app from "@/app";
import request from "supertest";
import crypto from "crypto";
import { resetDb } from "../../helpers/cleanup";
import TheaterFactory from "../../factories/theater.factory";
import MovieFactory from "../../factories/movie.factory";
import ShowFactory from "../../factories/show.factory";
import TheaterErrorCode from "@/modules/theater/error/TheaterErrorCode";
import AppErrorCode from "@/core/error/AppErrorCode";

const API = "/api/theaters";
const TEST_DATE = "2026-08-15";

beforeEach(async () => {
  await resetDb();
});

describe("GET /api/theaters/:id/shows", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 200 with theater shows grouped by movies for valid date", async () => {
      const theater = await TheaterFactory.createTheater({
        name: "PVR Phoenix Lower Parel",
        city: "Mumbai",
      });

      const movie1 = await MovieFactory.createMovie({
        title: "Pushpa: The Rise",
        posterUrl: "https://example.com/pushpa.jpg",
        language: "Telugu",
      });

      const movie2 = await MovieFactory.createMovie({
        title: "Inception",
        posterUrl: "https://example.com/inception.jpg",
        language: "English",
      });

      const show1 = await ShowFactory.createShow(movie1.id, theater.id, {
        onDate: new Date(TEST_DATE),
        startTime: new Date(Date.UTC(1970, 0, 1, 10, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 12, 30, 0)),
        basePrice: 250,
      });

      const show2 = await ShowFactory.createShow(movie1.id, theater.id, {
        onDate: new Date(TEST_DATE),
        startTime: new Date(Date.UTC(1970, 0, 1, 14, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 16, 30, 0)),
        basePrice: 300,
      });

      const show3 = await ShowFactory.createShow(movie2.id, theater.id, {
        onDate: new Date(TEST_DATE),
        startTime: new Date(Date.UTC(1970, 0, 1, 18, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 20, 30, 0)),
        basePrice: 350,
      });

      const res = await request(app)
        .get(`${API}/${theater.id}/shows`)
        .query({ date: TEST_DATE })
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data.theaterId).toBe(theater.id);
      expect(res.body.data.onDate).toBe(TEST_DATE);
      expect(res.body.data.movies).toHaveLength(2);

      const returnedMovie1 = res.body.data.movies.find(
        (m: any) => m.movieId === movie1.id,
      );
      expect(returnedMovie1).toBeDefined();
      expect(returnedMovie1.title).toBe(movie1.title);
      expect(returnedMovie1.posterUrl).toBe(movie1.posterUrl);
      expect(returnedMovie1.language).toBe(movie1.language);
      expect(returnedMovie1.shows).toHaveLength(2);
      expect(returnedMovie1.shows[0]).toMatchObject({
        id: show1.id,
        basePrice: 250,
      });
      expect(returnedMovie1.shows[1]).toMatchObject({
        id: show2.id,
        basePrice: 300,
      });

      const returnedMovie2 = res.body.data.movies.find(
        (m: any) => m.movieId === movie2.id,
      );
      expect(returnedMovie2).toBeDefined();
      expect(returnedMovie2.title).toBe(movie2.title);
      expect(returnedMovie2.shows).toHaveLength(1);
      expect(returnedMovie2.shows[0]).toMatchObject({
        id: show3.id,
        basePrice: 350,
      });
    });

    it("should return empty movies array when theater has no shows on that date", async () => {
      const theater = await TheaterFactory.createTheater({ city: "Mumbai" });
      const movie = await MovieFactory.createMovie();

      await ShowFactory.createShow(movie.id, theater.id, {
        onDate: new Date("2026-08-20"),
      });

      const res = await request(app)
        .get(`${API}/${theater.id}/shows`)
        .query({ date: TEST_DATE })
        .expect(200);

      expect(res.body.data.theaterId).toBe(theater.id);
      expect(res.body.data.onDate).toBe(TEST_DATE);
      expect(res.body.data.movies).toEqual([]);
    });

    it("should sort shows in ascending order of start time", async () => {
      const theater = await TheaterFactory.createTheater();
      const movie = await MovieFactory.createMovie();

      // Insert later show first
      const lateShow = await ShowFactory.createShow(movie.id, theater.id, {
        onDate: new Date(TEST_DATE),
        startTime: new Date(Date.UTC(1970, 0, 1, 20, 0, 0)),
      });

      // Insert earlier show second
      const earlyShow = await ShowFactory.createShow(movie.id, theater.id, {
        onDate: new Date(TEST_DATE),
        startTime: new Date(Date.UTC(1970, 0, 1, 9, 30, 0)),
      });

      const res = await request(app)
        .get(`${API}/${theater.id}/shows`)
        .query({ date: TEST_DATE })
        .expect(200);

      const returnedShows = res.body.data.movies[0].shows;
      expect(returnedShows).toHaveLength(2);
      expect(returnedShows[0].id).toBe(earlyShow.id);
      expect(returnedShows[1].id).toBe(lateShow.id);
    });
  });

  // ─── Not Found (404) ───────────────────────────────────────
  describe("Not Found", () => {
    it("should return 404 with THEATER_NOT_FOUND when theater does not exist", async () => {
      const nonExistentTheaterId = crypto.randomUUID();

      const res = await request(app)
        .get(`${API}/${nonExistentTheaterId}/shows`)
        .query({ date: TEST_DATE })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(TheaterErrorCode.THEATER_NOT_FOUND);
      expect(res.body.error.message).toBe("Theater not found");
    });
  });

  // ─── Validation errors (400) ──────────────────────────────
  describe("Validation", () => {
    it("should return 400 when theater id is not a valid UUID", async () => {
      const res = await request(app)
        .get(`${API}/not-a-uuid/shows`)
        .query({ date: TEST_DATE })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
      expect(res.body.error.message).toBe("Missing or invalid path parameters");
    });

    it("should return 400 when query parameters are missing", async () => {
      const theater = await TheaterFactory.createTheater();

      const res = await request(app)
        .get(`${API}/${theater.id}/shows`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
      expect(res.body.error.message).toBe("Missing or invalid query parameters");
    });

    it("should return 400 when date query parameter is missing", async () => {
      const theater = await TheaterFactory.createTheater();

      const res = await request(app)
        .get(`${API}/${theater.id}/shows`)
        .query({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });

    it("should return 400 when date query parameter is not a valid ISO date", async () => {
      const theater = await TheaterFactory.createTheater();

      const res = await request(app)
        .get(`${API}/${theater.id}/shows`)
        .query({ date: "not-a-valid-date" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });
  });
});
