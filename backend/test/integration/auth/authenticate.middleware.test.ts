import { resetDb } from "../../helpers/cleanup";
import request from "supertest";
import app from "@/app";
import AuthHelper from "../../helpers/auth.helper";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";
import SessionFactory from "../../factories/session.factory";
import UserFactory from "../../factories/user.factory";

describe("Authenticate Middleware", () => {
  // Using /api/auth/logout as a protected route to test the middleware
  const PROTECTED_PATH = "/api/auth/logout";

  beforeEach(async () => {
    await resetDb();
  });

  // ── Missing Token ─────────────────────────────────────────────────────────

  it("should return 401 when no Authorization header is provided", async () => {
    const response = await request(app)
      .post(PROTECTED_PATH)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  it("should return 401 when Authorization header is empty", async () => {
    const response = await request(app)
      .post(PROTECTED_PATH)
      .set("Authorization", "")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  it("should return 401 when Authorization header has no Bearer prefix", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const response = await request(app)
      .post(PROTECTED_PATH)
      .set("Authorization", authUser.session.accessToken)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  // ── Invalid Token ─────────────────────────────────────────────────────────

  it("should return 401 when access token is malformed", async () => {
    const response = await request(app)
      .post(PROTECTED_PATH)
      .set("Authorization", "Bearer totally.invalid.token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });

  it("should return 401 when access token is a random string", async () => {
    const response = await request(app)
      .post(PROTECTED_PATH)
      .set("Authorization", "Bearer randomgarbage123")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });

  // ── Valid Token ───────────────────────────────────────────────────────────

  it("should allow access with a valid Bearer token", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    // Logout is a 204, meaning the middleware passed
    const response = await request(app)
      .post(PROTECTED_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(204);

    expect(response.body).toEqual({});
  });
});
