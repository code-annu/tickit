import request from "supertest";
import app from "@/app";
import { prisma } from "@/config/prisma.client";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import ErrorCode from "@/shared/error/ErrorCode";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

const BASE_PATH = "/api/movie/bookings/streaming-theaters";

describe("GET /api/movie/bookings/streaming-theaters/:streamingId/seats", () => {
  let cookies: any;
  let accessToken: string;

  beforeAll(async () => {
    await resetDb();
    const { authUser, cookies: authCookies } =
      await AuthHelper.getAuthenticatedUser();
    cookies = authCookies;
    accessToken = authUser.session.accessToken;
  });

  afterAll(async () => {
    await resetDb();
  });

  // ── Authentication ────────────────────────────────────────────────

  it("should return 401 when no authorization header is provided", async () => {
    const streaming = await prisma.streamingTheater.findFirst();
    expect(streaming).not.toBeNull();

    const res = await request(app)
      .get(`${BASE_PATH}/${streaming!.id}/seats`)
      .expect(401);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  it("should return 401 when an invalid token is provided", async () => {
    const streaming = await prisma.streamingTheater.findFirst();
    expect(streaming).not.toBeNull();

    const res = await request(app)
      .get(`${BASE_PATH}/${streaming!.id}/seats`)
      .set("Authorization", "Bearer invalid-token")
      .expect(401);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });

  // ── Validation ────────────────────────────────────────────────────

  it("should return 400 when streamingId is not a valid UUID", async () => {
    const res = await request(app)
      .get(`${BASE_PATH}/not-a-uuid/seats`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  // ── Happy path ────────────────────────────────────────────────────

  it("should return 200 with seat inventory for a valid streaming id", async () => {
    const streaming = await prisma.streamingTheater.findFirst();
    expect(streaming).not.toBeNull();

    const res = await request(app)
      .get(`${BASE_PATH}/${streaming!.id}/seats`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty("seatInventory");
    expect(res.body.data).toHaveProperty("count");
    expect(Array.isArray(res.body.data.seatInventory)).toBeTruthy();
    expect(res.body.data.count).toBe(res.body.data.seatInventory.length);
  });

  it("should return seat inventory items with the correct shape", async () => {
    const inventory = await prisma.theaterSeatInventory.findFirst({
      include: { seat: true },
    });
    expect(inventory).not.toBeNull();

    const res = await request(app)
      .get(`${BASE_PATH}/${inventory!.streamingId}/seats`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.seatInventory.length).toBeGreaterThan(0);

    const item = res.body.data.seatInventory[0];
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("seat");
    expect(item).toHaveProperty("price");
    expect(item).toHaveProperty("status");

    // Verify nested seat shape
    expect(item.seat).toHaveProperty("id");
    expect(item.seat).toHaveProperty("seatNumber");
  });

  it("should return all seat inventories that belong to the given streaming", async () => {
    const streaming = await prisma.streamingTheater.findFirst();
    expect(streaming).not.toBeNull();

    const expectedCount = await prisma.theaterSeatInventory.count({
      where: { streamingId: streaming!.id },
    });

    const res = await request(app)
      .get(`${BASE_PATH}/${streaming!.id}/seats`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.count).toBe(expectedCount);
    expect(res.body.data.seatInventory).toHaveLength(expectedCount);
  });

  // ── Edge: non-existent streaming ─────────────────────────────────

  it("should return 200 with empty inventory for a non-existent streaming id", async () => {
    const nonExistentUuid = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`${BASE_PATH}/${nonExistentUuid}/seats`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data.seatInventory).toEqual([]);
    expect(res.body.data.count).toBe(0);
  });
});
