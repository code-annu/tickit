import request from "supertest";
import app from "@/app";
import { prisma } from "@/core/prisma/prisma.client";

describe("GET /api/movies/:id", () => {
  let existingMovieId: string;

  beforeAll(async () => {
    const movie = await prisma.movie.findFirst();
    if (!movie) throw new Error("No movies in DB. Run seed:movie first.");
    existingMovieId = movie.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 200 with movie details for a valid id", async () => {
    const response = await request(app).get(
      `/api/movies/${existingMovieId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Movie details fetched successfully");
    expect(response.body.data).toHaveProperty("id", existingMovieId);
  });

  it("should return movie with correct shape", async () => {
    const response = await request(app).get(
      `/api/movies/${existingMovieId}`,
    );

    expect(response.status).toBe(200);

    const movie = response.body.data;
    expect(movie).toHaveProperty("id");
    expect(movie).toHaveProperty("title");
    expect(movie).toHaveProperty("posterUrl");
    expect(movie).toHaveProperty("language");
    expect(movie).toHaveProperty("overview");
    expect(movie).toHaveProperty("releasedDate");
    expect(movie).toHaveProperty("createdAt");
    expect(movie).toHaveProperty("updatedAt");
  });

  it("should return 404 when movie does not exist", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const response = await request(app).get(
      `/api/movies/${nonExistentId}`,
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "MOVIE_NOT_FOUND");
    expect(response.body.error).toHaveProperty("message", "Movie not found");
  });

  it("should return 400 for an invalid UUID", async () => {
    const response = await request(app).get("/api/movies/invalid-uuid");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty("code", "INVALID_REQUEST");
  });
});
