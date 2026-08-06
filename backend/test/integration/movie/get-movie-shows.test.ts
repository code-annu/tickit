import request from "supertest";
import app from "@/app";
import { prisma } from "@/core/prisma/prisma.client";

describe("GET /api/movies/:id/shows", () => {
  let existingMovieId: string;
  let showCity: string;
  let showDate: string;

  beforeAll(async () => {
    // Find a show that exists in the DB so we can test with real data
    const show = await prisma.show.findFirst({
      include: { theater: true },
    });

    if (!show) throw new Error("No shows in DB. Run seed:all first.");

    existingMovieId = show.movieId;
    showCity = show.theater.city;
    // Format date as YYYY-MM-DD for query string
    showDate = show.onDate.toISOString().slice(0, 10);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 200 with movie and shows for valid params", async () => {
    const response = await request(app)
      .get(`/api/movies/${existingMovieId}/shows`)
      .query({ city: showCity, date: showDate });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Movie shows fetched successfully");
    expect(response.body.data).toHaveProperty("movie");
    expect(response.body.data).toHaveProperty("shows");
    expect(response.body.data.movie.id).toBe(existingMovieId);
  });

  it("should return movie with correct shape in the response", async () => {
    const response = await request(app)
      .get(`/api/movies/${existingMovieId}/shows`)
      .query({ city: showCity, date: showDate });

    expect(response.status).toBe(200);

    const movie = response.body.data.movie;
    expect(movie).toHaveProperty("id");
    expect(movie).toHaveProperty("title");
    expect(movie).toHaveProperty("posterUrl");
    expect(movie).toHaveProperty("language");
    expect(movie).toHaveProperty("overview");
    expect(movie).toHaveProperty("releasedDate");
  });

  it("should return shows with correct shape", async () => {
    const response = await request(app)
      .get(`/api/movies/${existingMovieId}/shows`)
      .query({ city: showCity, date: showDate });

    expect(response.status).toBe(200);

    const shows = response.body.data.shows;
    expect(Array.isArray(shows)).toBe(true);

    if (shows.length > 0) {
      const show = shows[0];
      expect(show).toHaveProperty("id");
      expect(show).toHaveProperty("theater");
      expect(show).toHaveProperty("onDate");
      expect(show).toHaveProperty("startTime");
      expect(show).toHaveProperty("onwardsPrice");

      const theater = show.theater;
      expect(theater).toHaveProperty("id");
      expect(theater).toHaveProperty("name");
      expect(theater).toHaveProperty("city");
      expect(theater).toHaveProperty("address");
      expect(theater).toHaveProperty("avatarUrl");
      expect(theater).toHaveProperty("rating");
    }
  });

  it("should return empty shows array for a city with no shows", async () => {
    const response = await request(app)
      .get(`/api/movies/${existingMovieId}/shows`)
      .query({ city: "NonExistentCity", date: showDate });

    expect(response.status).toBe(200);
    expect(response.body.data.shows).toEqual([]);
  });

  it("should return empty shows array for a date with no shows", async () => {
    const response = await request(app)
      .get(`/api/movies/${existingMovieId}/shows`)
      .query({ city: showCity, date: "2000-01-01" });

    expect(response.status).toBe(200);
    expect(response.body.data.shows).toEqual([]);
  });

  it("should return 404 when movie does not exist", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const response = await request(app)
      .get(`/api/movies/${nonExistentId}/shows`)
      .query({ city: showCity, date: showDate });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "MOVIE_NOT_FOUND");
  });

  it("should return 400 for an invalid UUID in params", async () => {
    const response = await request(app)
      .get("/api/movies/not-a-uuid/shows")
      .query({ city: showCity, date: showDate });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "INVALID_REQUEST");
  });

  it("should return 400 when city query param is missing", async () => {
    const response = await request(app)
      .get(`/api/movies/${existingMovieId}/shows`)
      .query({ date: showDate });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "INVALID_REQUEST");
  });

  it("should return 400 when date query param is missing", async () => {
    const response = await request(app)
      .get(`/api/movies/${existingMovieId}/shows`)
      .query({ city: showCity });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "INVALID_REQUEST");
  });
});
