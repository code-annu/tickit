import app from "@/app";
import { resetDb } from "../../helpers/cleanup";
import request from "supertest";
import UserFactory from "../../factories/user.factory";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";
import ErrorCode from "@/core/error/ErrorCode";
import SessionFactory from "../../factories/session.factory";

describe("POST /api/auth/login", () => {
  const LOGIN_PATH = "/api/auth/login";

  beforeEach(async () => {
    await resetDb();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  it("should login successfully and return 200 with session and user data", async () => {
    await UserFactory.createUser("peter@gmail.com", "Peter@1234");

    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
    expect(response.body.data.session).toHaveProperty("id");
    expect(response.body.data.session).toHaveProperty("accessToken");
    expect(response.body.data.user.email).toBe("peter@gmail.com");
  });

  it("should set a refreshToken cookie on successful login", async () => {
    await UserFactory.createUser("peter@gmail.com", "Peter@1234");

    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(200);

    const cookies = response.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const refreshCookie = Array.isArray(cookies)
      ? cookies.find((c: string) => c.startsWith("refreshToken="))
      : (cookies as string).startsWith("refreshToken=")
        ? cookies
        : undefined;
    expect(refreshCookie).toBeDefined();
  });

  it("should replace existing session on re-login", async () => {
    const user = await UserFactory.createUser("peter@gmail.com", "Peter@1234");

    // First login
    const firstResponse = await request(app)
      .post(LOGIN_PATH)
      .send({ email: "peter@gmail.com", password: "Peter@1234" })
      .expect(200);

    const firstSessionId = firstResponse.body.data.session.id;

    // Second login (should replace)
    const secondResponse = await request(app)
      .post(LOGIN_PATH)
      .send({ email: "peter@gmail.com", password: "Peter@1234" })
      .expect(200);

    const secondSessionId = secondResponse.body.data.session.id;

    expect(firstSessionId).not.toBe(secondSessionId);

    // Old session should be deleted
    const oldSession = await SessionFactory.findById(firstSessionId);
    expect(oldSession).toBeNull();

    // New session should exist
    const sessions = await SessionFactory.findManyByUserId(user.id);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe(secondSessionId);
  });

  // ── Invalid Credentials ───────────────────────────────────────────────────

  it("should return 401 when user email is not found", async () => {
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "unknown@gmail.com",
        password: "Peter@1234",
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("should return 401 when password is incorrect", async () => {
    await UserFactory.createUser("peter@gmail.com", "Peter@1234");

    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "WrongPass@99",
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("should return 401 when user is soft-deleted", async () => {
    const user = await UserFactory.createUser("peter@gmail.com", "Peter@1234");
    await UserFactory.update(user.id, { deletedAt: new Date() });

    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("should return 401 when user is banned", async () => {
    const user = await UserFactory.createUser("peter@gmail.com", "Peter@1234");
    await UserFactory.update(user.id, { isBanned: true });

    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  // ── Validation Errors ─────────────────────────────────────────────────────

  it("should return 400 for invalid email format", async () => {
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "not-an-email",
        password: "Peter@1234",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when email is missing", async () => {
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({ password: "Peter@1234" })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when password is missing", async () => {
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({ email: "peter@gmail.com" })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when body is empty", async () => {
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });
});
