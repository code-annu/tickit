import app from "@/app";
import request from "supertest";
import crypto from "crypto";
import { resetDb } from "../../helpers/cleanup";
import MovieFactory from "../../factories/movie.factory";
import TheaterFactory from "../../factories/theater.factory";
import ShowFactory from "../../factories/show.factory";
import MovieErrorCode from "@/modules/movie/error/MovieErrorCode";
import AppErrorCode from "@/core/error/AppErrorCode";

const API = "/api/movies";
const TEST_DATE = "2026-08-15";
const TEST_CITY = "Mumbai";

beforeEach(async () => {
  await resetDb();
});

describe("GET /api/movies/:id/shows", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 200 with movie shows grouped by theaters for valid city and date", async () => {
      const movie = await MovieFactory.createMovie({ title: "Pushpa: The Rise" });
      const theater = await TheaterFactory.createTheater({
        name: "PVR Phoenix Lower Parel",
        city: "Mumbai",
        address: "Senapati Bapat Marg, Lower Parel",
        rating: 4.6,
      });

      const show1 = await ShowFactory.createShow(movie.id, theater.id, {
        onDate: new Date(TEST_DATE),
        startTime: new Date(Date.UTC(1970, 0, 1, 10, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 12, 30, 0)),
        basePrice: 250,
      });

      const show2 = await ShowFactory.createShow(movie.id, theater.id, {
        onDate: new Date(TEST_DATE),
        startTime: new Date(Date.UTC(1970, 0, 1, 14, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 16, 30, 0)),
        basePrice: 300,
      });

      const res = await request(app)
        .get(`${API}/${movie.id}/shows`)
        .query({ city: TEST_CITY, date: TEST_DATE })
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data.movieId).toBe(movie.id);
      expect(res.body.data.onDate).toBe(TEST_DATE);
      expect(res.body.data.theaters).toHaveLength(1);

      const returnedTheater = res.body.data.theaters[0];
      expect(returnedTheater.id).toBe(theater.id);
      expect(returnedTheater.name).toBe(theater.name);
      expect(returnedTheater.city).toBe(theater.city);
      expect(returnedTheater.shows).toHaveLength(2);

      expect(returnedTheater.shows[0]).toMatchObject({
        id: show1.id,
        basePrice: 250,
      });
      expect(returnedTheater.shows[1]).toMatchObject({
        id: show2.id,
        basePrice: 300,
      });
    });

    it("should perform case-insensitive city search", async () => {
      const movie = await MovieFactory.createMovie();
      const theater = await TheaterFactory.createTheater({
        name: "Cinepolis Andheri",
        city: "Mumbai",
      });

      await ShowFactory.createShow(movie.id, theater.id, {
        onDate: new Date(TEST_DATE),
      });

      const res = await request(app)
        .get(`${API}/${movie.id}/shows`)
        .query({ city: "mumbai", date: TEST_DATE })
        .expect(200);

      expect(res.body.data.theaters).toHaveLength(1);
      expect(res.body.data.theaters[0].id).toBe(theater.id);
    });

    it("should return empty theaters array when movie has no shows in that city", async () => {
      const movie = await MovieFactory.createMovie();
      const theaterInDelhi = await TheaterFactory.createTheater({
        name: "PVR Plaza",
        city: "Delhi",
      });

      await ShowFactory.createShow(movie.id, theaterInDelhi.id, {
        onDate: new Date(TEST_DATE),
      });

      const res = await request(app)
        .get(`${API}/${movie.id}/shows`)
        .query({ city: "Mumbai", date: TEST_DATE })
        .expect(200);

      expect(res.body.data.movieId).toBe(movie.id);
      expect(res.body.data.onDate).toBe(TEST_DATE);
      expect(res.body.data.theaters).toEqual([]);
    });

    it("should return empty theaters array when movie has no shows on that date", async () => {
      const movie = await MovieFactory.createMovie();
      const theater = await TheaterFactory.createTheater({ city: "Mumbai" });

      await ShowFactory.createShow(movie.id, theater.id, {
        onDate: new Date("2026-08-20"),
      });

      const res = await request(app)
        .get(`${API}/${movie.id}/shows`)
        .query({ city: "Mumbai", date: TEST_DATE })
        .expect(200);

      expect(res.body.data.movieId).toBe(movie.id);
      expect(res.body.data.onDate).toBe(TEST_DATE);
      expect(res.body.data.theaters).toEqual([]);
    });

    it("should sort shows in ascending order of start time", async () => {
      const movie = await MovieFactory.createMovie();
      const theater = await TheaterFactory.createTheater({ city: "Mumbai" });

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
        .get(`${API}/${movie.id}/shows`)
        .query({ city: "Mumbai", date: TEST_DATE })
        .expect(200);

      const returnedShows = res.body.data.theaters[0].shows;
      expect(returnedShows).toHaveLength(2);
      expect(returnedShows[0].id).toBe(earlyShow.id);
      expect(returnedShows[1].id).toBe(lateShow.id);
    });
  });

  // ─── Not Found (404) ───────────────────────────────────────
  describe("Not Found", () => {
    it("should return 404 with MOVIE_NOT_FOUND when movie does not exist", async () => {
      const nonExistentMovieId = crypto.randomUUID();

      const res = await request(app)
        .get(`${API}/${nonExistentMovieId}/shows`)
        .query({ city: TEST_CITY, date: TEST_DATE })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(MovieErrorCode.MOVIE_NOT_FOUND);
      expect(res.body.error.message).toBe("Movie not found");
    });
  });

  // ─── Validation errors (400) ──────────────────────────────
  describe("Validation", () => {
    it("should return 400 when movie id is not a valid UUID", async () => {
      const res = await request(app)
        .get(`${API}/not-a-uuid/shows`)
        .query({ city: TEST_CITY, date: TEST_DATE })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
      expect(res.body.error.message).toBe("Missing or invalid path parameters");
    });

    it("should return 400 when query parameters are missing", async () => {
      const movie = await MovieFactory.createMovie();

      const res = await request(app)
        .get(`${API}/${movie.id}/shows`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
      expect(res.body.error.message).toBe("Missing or invalid query parameters");
    });

    it("should return 400 when city query parameter is missing", async () => {
      const movie = await MovieFactory.createMovie();

      const res = await request(app)
        .get(`${API}/${movie.id}/shows`)
        .query({ date: TEST_DATE })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });

    it("should return 400 when city query parameter is less than 2 characters", async () => {
      const movie = await MovieFactory.createMovie();

      const res = await request(app)
        .get(`${API}/${movie.id}/shows`)
        .query({ city: "M", date: TEST_DATE })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });

    it("should return 400 when date query parameter is missing", async () => {
      const movie = await MovieFactory.createMovie();

      const res = await request(app)
        .get(`${API}/${movie.id}/shows`)
        .query({ city: TEST_CITY })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });

    it("should return 400 when date query parameter is not a valid ISO date", async () => {
      const movie = await MovieFactory.createMovie();

      const res = await request(app)
        .get(`${API}/${movie.id}/shows`)
        .query({ city: TEST_CITY, date: "not-a-valid-date" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });
  });
});
