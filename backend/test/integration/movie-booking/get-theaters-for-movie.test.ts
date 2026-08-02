import request from "supertest";
import app from "@/app";
import { prisma } from "@/config/prisma.client";
import ErrorCode from "@/shared/error/ErrorCode";

const BASE_PATH = "/api/streaming-movies";

describe("GET /api/streaming-movies/:movieId/streaming-theaters", () => {
  it("Should return streaming theaters for a valid movie, city, and future date", async () => {
    // 1. Fetch a movie and a streaming record from the DB to get seeded test inputs
    const streaming = await prisma.theaterStreaming.findFirst({
      include: {
        movie: true,
        theater: true,
      },
    });

    expect(streaming).not.toBeNull();

    // Use a date that passes the schema validation constraint (>= now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateStr = futureDate.toISOString();

    const res = await request(app)
      .get(
        `${BASE_PATH}/${streaming!.movieId}/streaming-theaters?city=${encodeURIComponent(streaming!.theater.city)}&date=${encodeURIComponent(dateStr)}`,
      )
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe(
      "Streaming theaters for movie fetched successfully",
    );
    expect(res.body.data).toHaveProperty("movie");
    expect(res.body.data.movie.id).toBe(streaming!.movieId);
    expect(res.body.data).toHaveProperty("theaters");
    expect(Array.isArray(res.body.data.theaters)).toBeTruthy();
    expect(res.body.data).toHaveProperty("theatersCount");
  });

  it("Should return 400 when city query parameter is missing", async () => {
    const validUuid = "00000000-0000-0000-0000-000000000000";
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const res = await request(app)
      .get(
        `${BASE_PATH}/${validUuid}/streaming-theaters?date=${encodeURIComponent(futureDate.toISOString())}`,
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

  it("Should return 400 when date query parameter is in the past", async () => {
    const validUuid = "00000000-0000-0000-0000-000000000000";
    const pastDate = new Date("2020-01-01").toISOString();

    const res = await request(app)
      .get(
        `${BASE_PATH}/${validUuid}/streaming-theaters?city=Mumbai&date=${encodeURIComponent(pastDate)}`,
      )
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("Should return 400 when movieId is not a valid UUID", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const res = await request(app)
      .get(
        `${BASE_PATH}/invalid-uuid/streaming-theaters?city=Mumbai&date=${encodeURIComponent(futureDate.toISOString())}`,
      )
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("Should return 404 when movie ID does not exist in DB", async () => {
    const nonExistentUuid = "00000000-0000-0000-0000-000000000000";
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const res = await request(app)
      .get(
        `${BASE_PATH}/${nonExistentUuid}/streaming-theaters?city=Mumbai&date=${encodeURIComponent(futureDate.toISOString())}`,
      )
      .expect(404);

    expect(res.body.success).toBeFalsy();
  });
});
