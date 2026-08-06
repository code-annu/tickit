import request from "supertest";
import app from "@/app";
import { prisma } from "@/core/prisma/prisma.client";

describe("GET /api/movies", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 200 with a list of movies", async () => {
    const response = await request(app).get("/api/movies");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Movies fetched successfully");
    expect(response.body.data).toHaveProperty("movies");
    expect(response.body.data).toHaveProperty("totalMovies");
    expect(Array.isArray(response.body.data.movies)).toBe(true);
  });

  it("should return movies with correct shape", async () => {
    const response = await request(app).get("/api/movies");

    expect(response.status).toBe(200);

    const movies = response.body.data.movies;
    expect(movies.length).toBeGreaterThan(0);

    const movie = movies[0];
    expect(movie).toHaveProperty("id");
    expect(movie).toHaveProperty("title");
    expect(movie).toHaveProperty("posterUrl");
    expect(movie).toHaveProperty("language");
    expect(movie).toHaveProperty("overview");
    expect(movie).toHaveProperty("releasedDate");
    expect(movie).toHaveProperty("createdAt");
    expect(movie).toHaveProperty("updatedAt");
  });

  it("should return totalMovies matching the movies array length", async () => {
    const response = await request(app).get("/api/movies");

    expect(response.status).toBe(200);

    const { movies, totalMovies } = response.body.data;
    expect(totalMovies).toBe(movies.length);
  });
});
