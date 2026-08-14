import app from "@/app";
import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import UserFactory from "../../factories/user.factory";
import SessionFactory from "../../factories/session.factory";
import AuthErrorCode from "@/modules/auth/error/AuthErrorCode";

const API = "/api/auth/signup";

const validPayload = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "Passw0rd!",
  city: "Mumbai",
  gender: "MALE",
};

beforeEach(async () => {
  await resetDb();
});

describe("POST /api/auth/signup", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should create a new user and return 201 with user, session, and refresh cookie", async () => {
      const res = await request(app).post(API).send(validPayload).expect(201);

      // Response body shape
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("session");
      expect(res.body.user).toMatchObject({
        email: validPayload.email,
        isEmailVerified: false,
      });
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
      expect(refreshCookie).toContain("Path=/api/auth/refresh");
    });

    it("should persist the user in the database", async () => {
      await request(app).post(API).send(validPayload).expect(201);

      const user = await UserFactory.findByEmail(validPayload.email);
      expect(user).not.toBeNull();
      expect(user!.email).toBe(validPayload.email);
      expect(user!.firstName).toBe(validPayload.firstName);
    });

    it("should persist a session record in the database", async () => {
      const res = await request(app).post(API).send(validPayload).expect(201);

      const sessions = await SessionFactory.findManyByUserId(res.body.user.id);
      expect(sessions).toHaveLength(1);
    });

    it("should accept optional nullable fields as null", async () => {
      const res = await request(app)
        .post(API)
        .send({
          ...validPayload,
          lastName: null,
          dob: null,
          avatarUrl: null,
        })
        .expect(201);

      expect(res.body.user).toHaveProperty("id");
    });

    it("should accept a valid dob and avatarUrl", async () => {
      const res = await request(app)
        .post(API)
        .send({
          ...validPayload,
          email: "dob-test@example.com",
          dob: "2000-06-15",
          avatarUrl: "https://example.com/avatar.png",
        })
        .expect(201);

      expect(res.body.user).toHaveProperty("id");
    });
  });

  // ─── Duplicate email ───────────────────────────────────────
  describe("Duplicate email", () => {
    it("should return 409 CONFLICT when email already exists", async () => {
      await UserFactory.createUser(validPayload.email, validPayload.password);

      const res = await request(app).post(API).send(validPayload).expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.EMAIL_ALREADY_EXISTS);
    });
  });

  // ─── Validation errors (400) ──────────────────────────────
  describe("Validation", () => {
    it("should return 400 when body is empty", async () => {
      await request(app).post(API).send({}).expect(400);
    });

    it("should return 400 when firstName is missing", async () => {
      const { firstName, ...payload } = validPayload;
      const res = await request(app).post(API).send(payload).expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should return 400 when firstName is too short", async () => {
      const res = await request(app)
        .post(API)
        .send({ ...validPayload, firstName: "Ab" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should return 400 when email is invalid", async () => {
      const res = await request(app)
        .post(API)
        .send({ ...validPayload, email: "not-an-email" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should return 400 when password is too short", async () => {
      const res = await request(app)
        .post(API)
        .send({ ...validPayload, password: "Abc1!" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should return 400 when password has no uppercase letter", async () => {
      await request(app)
        .post(API)
        .send({ ...validPayload, password: "password1!" })
        .expect(400);
    });

    it("should return 400 when password has no lowercase letter", async () => {
      await request(app)
        .post(API)
        .send({ ...validPayload, password: "PASSWORD1!" })
        .expect(400);
    });

    it("should return 400 when password has no number", async () => {
      await request(app)
        .post(API)
        .send({ ...validPayload, password: "Password!" })
        .expect(400);
    });

    it("should return 400 when password has no special character", async () => {
      await request(app)
        .post(API)
        .send({ ...validPayload, password: "Password1" })
        .expect(400);
    });

    it("should return 400 when gender is invalid", async () => {
      await request(app)
        .post(API)
        .send({ ...validPayload, gender: "INVALID" })
        .expect(400);
    });

    it("should return 400 when city is missing", async () => {
      const { city, ...payload } = validPayload;
      await request(app).post(API).send(payload).expect(400);
    });

    it("should return 400 when dob is not a valid date string", async () => {
      await request(app)
        .post(API)
        .send({ ...validPayload, dob: "not-a-date" })
        .expect(400);
    });

    it("should return 400 when avatarUrl is not a valid URL", async () => {
      await request(app)
        .post(API)
        .send({ ...validPayload, avatarUrl: "not-a-url" })
        .expect(400);
    });
  });
});
