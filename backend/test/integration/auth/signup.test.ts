import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import app from "@/app";
import UserFactory from "../../factories/user.factory";
import UserErrorCode from "@/shared/user/UserErrorCode";
import ErrorCode from "@/core/error/ErrorCode";

describe("POST /api/auth/signup", () => {
  const SIGNUP_PATH = "/api/auth/signup";

  beforeEach(async () => {
    await resetDb();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  it("should create a new user and return 201 with session and user data", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("session");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data.session).toHaveProperty("id");
    expect(response.body.data.session).toHaveProperty("accessToken");
    expect(response.body.data.user.email).toBe("peter@gmail.com");
    expect(response.body.data.user.isEmailVerified).toBe(false);
  });

  it("should set a refreshToken cookie on successful signup", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(201);

    const cookies = response.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const refreshCookie = Array.isArray(cookies)
      ? cookies.find((c: string) => c.startsWith("refreshToken="))
      : (cookies as string).startsWith("refreshToken=")
        ? cookies
        : undefined;
    expect(refreshCookie).toBeDefined();
  });

  it("should persist the user in the database", async () => {
    await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(201);

    const dbUser = await UserFactory.findByEmail("peter@gmail.com");
    expect(dbUser).not.toBeNull();
    expect(dbUser.email).toBe("peter@gmail.com");
  });

  // ── Duplicate Email ───────────────────────────────────────────────────────

  it("should return 409 when email already exists", async () => {
    await UserFactory.createUser("peter@gmail.com", "Peter@1234");

    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(UserErrorCode.EMAIL_ALREADY_EXISTS);
  });

  // ── Validation Errors ─────────────────────────────────────────────────────

  it("should return 400 when email is invalid", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "not-an-email",
        password: "Peter@1234",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when password is too short", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "P@1a",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when password lacks special character", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter1234",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when password lacks uppercase letter", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "peter@1234",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when password lacks number", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@abcd",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when request body is empty", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when email is missing", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({ password: "Peter@1234" })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when password is missing", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({ email: "peter@gmail.com" })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });
});
