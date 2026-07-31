import request from "supertest";
import app from "@/app";
import { prisma } from "@/config/prisma.client";
import MovieErrorCode from "@/modules/movie_booking/errors/MovieErrorCode";

const BASE_PATH = "/api/streaming-movies";

describe("GET /api/streaming-movies", () => {
  it("Should return all streaming movies", async () => {
    const res = await request(app).get(BASE_PATH).expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Streaming movies fetched successfully");
    expect(Array.isArray(res.body.data)).toBeTruthy();
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);
  });

  it("Should return movies with correct shape", async () => {
    const res = await request(app).get(BASE_PATH).expect(200);

    const movie = res.body.data[0];
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

    const titles: string[] = res.body.data.map(
      (m: { title: string }) => m.title,
    );
    expect(titles).toContain("Pushpa: The Rise");
    expect(titles).toContain("Toxic");
    expect(titles).toContain("The Odyssey");
    expect(titles).toContain("Spider-Man: Brand New Day");
    expect(titles).toContain("Welcome to the Jungle");
  });
});

describe("GET /api/streaming-movies/:movieId", () => {
  it("Should return a movie by id", async () => {
    // Fetch a real movie id from the DB
    const movie = await prisma.movie.findFirst({
      where: { title: "Pushpa: The Rise" },
    });
    expect(movie).not.toBeNull();

    const res = await request(app)
      .get(`${BASE_PATH}/${movie!.id}`)
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Movie fetched successfully");
    expect(res.body.data.id).toBe(movie!.id);
    expect(res.body.data.title).toBe("Pushpa: The Rise");
    expect(res.body.data.language).toBe("Telugu");
  });

  it("Should return 404 for a non-existent movie id", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`${BASE_PATH}/${fakeId}`)
      .expect(404);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(MovieErrorCode.MOVIE_NOT_FOUND);
  });

  it("Should return 500 for an invalid uuid format", async () => {
    const res = await request(app)
      .get(`${BASE_PATH}/not-a-valid-uuid`)
      .expect(500);

    expect(res.body.success).toBeFalsy();
  });
});
