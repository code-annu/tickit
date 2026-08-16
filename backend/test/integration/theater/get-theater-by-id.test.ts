import app from "@/app";
import request from "supertest";
import crypto from "crypto";
import { resetDb } from "../../helpers/cleanup";
import TheaterFactory from "../../factories/theater.factory";
import TheaterErrorCode from "@/modules/theater/error/TheaterErrorCode";
import AppErrorCode from "@/core/error/AppErrorCode";

const API = "/api/theaters";

beforeEach(async () => {
  await resetDb();
});

describe("GET /api/theaters/:id", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 200 with full theater details when theater exists", async () => {
      const created = await TheaterFactory.createTheater({
        name: "PVR Phoenix Lower Parel",
        city: "Mumbai",
        address: "Senapati Bapat Marg, Lower Parel",
        rating: 4.6,
        avatarUrl: "https://example.com/pvr.jpg",
        seatingCapacity: 250,
      });

      const res = await request(app).get(`${API}/${created.id}`).expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toMatchObject({
        id: created.id,
        name: created.name,
        city: created.city,
        address: created.address,
        rating: created.rating,
        avatarUrl: created.avatarUrl,
        seatingCapacity: created.seatingCapacity,
      });
    });
  });

  // ─── Not Found (404) ───────────────────────────────────────
  describe("Not Found", () => {
    it("should return 404 with THEATER_NOT_FOUND when theater does not exist", async () => {
      const nonExistentId = crypto.randomUUID();

      const res = await request(app)
        .get(`${API}/${nonExistentId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(TheaterErrorCode.THEATER_NOT_FOUND);
      expect(res.body.error.message).toBe("Theater not found");
    });
  });

  // ─── Validation errors (400) ──────────────────────────────
  describe("Validation", () => {
    it("should return 400 when id is not a valid UUID", async () => {
      const res = await request(app).get(`${API}/invalid-uuid-123`).expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
      expect(res.body.error.message).toBe("Missing or invalid path parameters");
    });

    it("should return 400 when id is numeric instead of UUID", async () => {
      const res = await request(app).get(`${API}/12345`).expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });
  });
});
