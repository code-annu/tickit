import app from "@/app";
import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import UserFactory from "../../factories/user.factory";
import SessionFactory from "../../factories/session.factory";
import AuthErrorCode from "@/modules/auth/error/AuthErrorCode";

const API = "/api/auth/login";
const TEST_EMAIL = "login-user@example.com";
const TEST_PASSWORD = "Passw0rd!";

beforeEach(async () => {
  await resetDb();
});

describe("POST /api/auth/login", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 200 with user, session, and refresh cookie", async () => {
      await UserFactory.createUser(TEST_EMAIL, TEST_PASSWORD);

      const res = await request(app)
        .post(API)
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);

      // Response shape
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("session");
      expect(res.body.user.email).toBe(TEST_EMAIL);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.session).toHaveProperty("id");
      expect(res.body.session).toHaveProperty("accessToken");

      // Refresh token cookie
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const refreshCookie = Array.isArray(cookies)
        ? cookies.find((c: string) => c.startsWith("refreshToken="))
        : cookies;
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain("HttpOnly");
    });

    it("should persist a session in the database after login", async () => {
      const user = await UserFactory.createUser(TEST_EMAIL, TEST_PASSWORD);

      const res = await request(app)
        .post(API)
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);

      const sessions = await SessionFactory.findManyByUserId(user.id);
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(res.body.session.id);
    });

    it("should replace existing session on re-login", async () => {
      const user = await UserFactory.createUser(TEST_EMAIL, TEST_PASSWORD);

      // First login
      const first = await request(app)
        .post(API)
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);

      // Second login — should delete old session
      const second = await request(app)
        .post(API)
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);

      const sessions = await SessionFactory.findManyByUserId(user.id);
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(second.body.session.id);
      expect(sessions[0].id).not.toBe(first.body.session.id);
    });
  });

  // ─── Invalid credentials ──────────────────────────────────
  describe("Invalid credentials", () => {
    it("should return 401 when email does not exist", async () => {
      const res = await request(app)
        .post(API)
        .send({ email: "ghost@example.com", password: TEST_PASSWORD })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it("should return 401 when password is wrong", async () => {
      await UserFactory.createUser(TEST_EMAIL, TEST_PASSWORD);

      const res = await request(app)
        .post(API)
        .send({ email: TEST_EMAIL, password: "WrongPass1!" })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it("should return 401 when user is banned", async () => {
      const user = await UserFactory.createUser(TEST_EMAIL, TEST_PASSWORD);
      await UserFactory.update(user.id, { isBanned: true });

      const res = await request(app)
        .post(API)
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it("should return 401 when user is soft-deleted", async () => {
      const user = await UserFactory.createUser(TEST_EMAIL, TEST_PASSWORD);
      await UserFactory.update(user.id, { deletedAt: new Date() });

      const res = await request(app)
        .post(API)
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });
  });

  // ─── Validation errors (400) ──────────────────────────────
  describe("Validation", () => {
    it("should return 400 when body is empty", async () => {
      await request(app).post(API).send({}).expect(400);
    });

    it("should return 400 when email is missing", async () => {
      await request(app)
        .post(API)
        .send({ password: TEST_PASSWORD })
        .expect(400);
    });

    it("should return 400 when password is missing", async () => {
      await request(app)
        .post(API)
        .send({ email: TEST_EMAIL })
        .expect(400);
    });

    it("should return 400 when email is invalid format", async () => {
      await request(app)
        .post(API)
        .send({ email: "not-an-email", password: TEST_PASSWORD })
        .expect(400);
    });
  });
});
