import request from "supertest";
import app from "@/app";
import { prisma } from "@/config/prisma.client";
import MovieErrorCode from "@/modules/movie/domain/errors/MovieErrorCode";
import ErrorCode from "@/shared/error/ErrorCode";

const BASE_PATH = "/api/movie/listings";

describe("GET /api/movie/listings/:movieId/streaming-theaters", () => {
  it("Should return 200 with streaming theaters response for a valid movie and city", async () => {
    const streaming = await prisma.streamingTheater.findFirst({
      include: { movie: true, theater: true },
    });
    expect(streaming).not.toBeNull();

    const res = await request(app)
      .get(
        `${BASE_PATH}/${streaming!.movieId}/streaming-theaters?city=${encodeURIComponent(streaming!.theater.city)}&date=${encodeURIComponent(streaming!.onDate.toISOString())}`,
      )
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty("movie");
    expect(res.body.data.movie.id).toBe(streaming!.movieId);
    expect(res.body.data).toHaveProperty("streamingTheaters");
    expect(Array.isArray(res.body.data.streamingTheaters)).toBeTruthy();
    expect(res.body.data).toHaveProperty("theatersCount");
    expect(res.body.data.theatersCount).toBe(
      res.body.data.streamingTheaters.length,
    );
  });

  it("Should return streaming theaters with correct shape when results exist", async () => {
    const streaming = await prisma.streamingTheater.findFirst({
      include: { theater: true },
    });
    expect(streaming).not.toBeNull();

    const res = await request(app)
      .get(
        `${BASE_PATH}/${streaming!.movieId}/streaming-theaters?city=${encodeURIComponent(streaming!.theater.city)}&date=${encodeURIComponent(streaming!.onDate.toISOString())}`,
      )
      .expect(200);

    expect(res.body.data.streamingTheaters.length).toBeGreaterThan(0);

    const streamingTheater = res.body.data.streamingTheaters[0];
    expect(streamingTheater).toHaveProperty("id");
    expect(streamingTheater).toHaveProperty("theater");
    expect(streamingTheater).toHaveProperty("onDate");
    expect(streamingTheater).toHaveProperty("startTime");
    expect(streamingTheater).toHaveProperty("endTime");
    expect(streamingTheater).toHaveProperty("duration");
    expect(streamingTheater).toHaveProperty("onwardsAmount");

    expect(streamingTheater.theater).toHaveProperty("id");
    expect(streamingTheater.theater).toHaveProperty("name");
    expect(streamingTheater.theater).toHaveProperty("city");
    expect(streamingTheater.theater).toHaveProperty("address");
  });

  it("Should return movie details in the response", async () => {
    const streaming = await prisma.streamingTheater.findFirst({
      include: { movie: true, theater: true },
      where: { movie: { title: "Pushpa: The Rise" } },
    });
    expect(streaming).not.toBeNull();

    const res = await request(app)
      .get(
        `${BASE_PATH}/${streaming!.movieId}/streaming-theaters?city=${encodeURIComponent(streaming!.theater.city)}&date=${encodeURIComponent(streaming!.onDate.toISOString())}`,
      )
      .expect(200);

    expect(res.body.data.movie.id).toBe(streaming!.movieId);
    expect(res.body.data.movie.title).toBe("Pushpa: The Rise");
    expect(res.body.data.movie).toHaveProperty("posterUrl");
    expect(res.body.data.movie).toHaveProperty("language");
  });

  it("Should return empty theaters for a city with no streamings", async () => {
    const movie = await prisma.movie.findFirst();
    expect(movie).not.toBeNull();

    const res = await request(app)
      .get(
        `${BASE_PATH}/${movie!.id}/streaming-theaters?city=NonExistentCity&date=2026-08-03`,
      )
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data.streamingTheaters).toEqual([]);
    expect(res.body.data.theatersCount).toBe(0);
  });

  it("Should accept a past date without validation error", async () => {
    const movie = await prisma.movie.findFirst();
    expect(movie).not.toBeNull();

    const pastDate = new Date("2020-01-01").toISOString();

    const res = await request(app)
      .get(
        `${BASE_PATH}/${movie!.id}/streaming-theaters?city=Mumbai&date=${encodeURIComponent(pastDate)}`,
      )
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data.streamingTheaters).toEqual([]);
    expect(res.body.data.theatersCount).toBe(0);
  });

  it("Should return 400 when city query parameter is missing", async () => {
    const validUuid = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(
        `${BASE_PATH}/${validUuid}/streaming-theaters?date=2026-08-03`,
      )
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("Should return 400 when date query parameter is missing", async () => {
    const validUuid = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`${BASE_PATH}/${validUuid}/streaming-theaters?city=Mumbai`)
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("Should return 400 when movieId is not a valid UUID", async () => {
    const res = await request(app)
      .get(
        `${BASE_PATH}/invalid-uuid/streaming-theaters?city=Mumbai&date=2026-08-03`,
      )
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("Should return 404 when movie ID does not exist in DB", async () => {
    const nonExistentUuid = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(
        `${BASE_PATH}/${nonExistentUuid}/streaming-theaters?city=Mumbai&date=2026-08-03`,
      )
      .expect(404);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(MovieErrorCode.MOVIE_NOT_FOUND);
  });
});
