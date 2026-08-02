import request from "supertest";
import app from "@/app";
import { prisma } from "@/config/prisma.client";
import MovieErrorCode from "@/modules/movie/domain/errors/MovieErrorCode";
import ErrorCode from "@/shared/error/ErrorCode";

const BASE_PATH = "/api/movie/listings";

describe("GET /api/movie/listings", () => {
  it("Should return all listed movies", async () => {
    const res = await request(app).get(BASE_PATH).expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe(
      "Movie listings retrieved successfully",
    );
    expect(res.body.data).toHaveProperty("movies");
    expect(res.body.data).toHaveProperty("moviesCount");
    expect(Array.isArray(res.body.data.movies)).toBeTruthy();
    expect(res.body.data.moviesCount).toBe(res.body.data.movies.length);
  });

  it("Should return movies with correct shape", async () => {
    const res = await request(app).get(BASE_PATH).expect(200);

    const movie = res.body.data.movies[0];
    expect(movie).toHaveProperty("id");
    expect(movie).toHaveProperty("title");
    expect(movie).toHaveProperty("posterUrl");
    expect(movie).toHaveProperty("releasedDate");
    expect(movie).toHaveProperty("overview");
    expect(movie).toHaveProperty("language");
    expect(movie).toHaveProperty("createdAt");
    expect(movie).toHaveProperty("updatedAt");
  });

  it("Should include the seeded movies", async () => {
    const res = await request(app).get(BASE_PATH).expect(200);

    const titles: string[] = res.body.data.movies.map(
      (m: { title: string }) => m.title,
    );
    expect(titles).toContain("Pushpa: The Rise");
    expect(titles).toContain("Toxic");
    expect(titles).toContain("The Odyssey");
    expect(titles).toContain("Spider-Man: Brand New Day");
    expect(titles).toContain("Welcome to the Jungle");
  });
});

describe("GET /api/movie/listings/:movieId", () => {
  it("Should return a movie by id", async () => {
    const movie = await prisma.movie.findFirst({
      where: { title: "Pushpa: The Rise" },
    });
    expect(movie).not.toBeNull();

    const res = await request(app)
      .get(`${BASE_PATH}/${movie!.id}`)
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Movie details retrieved successfully");
    expect(res.body.data.id).toBe(movie!.id);
    expect(res.body.data.title).toBe("Pushpa: The Rise");
    expect(res.body.data.language).toBe("Telugu");
  });

  it("Should return a movie with correct shape", async () => {
    const movie = await prisma.movie.findFirst();
    expect(movie).not.toBeNull();

    const res = await request(app)
      .get(`${BASE_PATH}/${movie!.id}`)
      .expect(200);

    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("title");
    expect(res.body.data).toHaveProperty("posterUrl");
    expect(res.body.data).toHaveProperty("releasedDate");
    expect(res.body.data).toHaveProperty("overview");
    expect(res.body.data).toHaveProperty("language");
    expect(res.body.data).toHaveProperty("createdAt");
    expect(res.body.data).toHaveProperty("updatedAt");
  });

  it("Should return 404 for a non-existent movie id", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`${BASE_PATH}/${fakeId}`)
      .expect(404);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(MovieErrorCode.MOVIE_NOT_FOUND);
  });

  it("Should return 400 for an invalid uuid format", async () => {
    const res = await request(app)
      .get(`${BASE_PATH}/not-a-valid-uuid`)
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });
});
