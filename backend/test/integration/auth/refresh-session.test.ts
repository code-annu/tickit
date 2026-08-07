import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import app from "@/app";
import AuthHelper from "../../helpers/auth.helper";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";
import SessionFactory from "../../factories/session.factory";
import UserFactory from "../../factories/user.factory";
import { subDays } from "date-fns";

describe("POST /api/auth/refresh-session", () => {
  const REFRESH_SESSION_PATH = "/api/auth/refresh-session";

  beforeEach(async () => {
    await resetDb();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  it("should refresh the session and return 200 with new tokens", async () => {
    const { cookies } = await AuthHelper.getAuthenticatedUser();

    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", cookies!)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("session");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data.session).toHaveProperty("id");
    expect(response.body.data.session).toHaveProperty("accessToken");
  });

  it("should set a new refreshToken cookie after refresh", async () => {
    const { cookies } = await AuthHelper.getAuthenticatedUser();

    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", cookies!)
      .expect(200);

    const newCookies = response.headers["set-cookie"];
    expect(newCookies).toBeDefined();
    const refreshCookie = Array.isArray(newCookies)
      ? newCookies.find((c: string) => c.startsWith("refreshToken="))
      : (newCookies as string).startsWith("refreshToken=")
        ? newCookies
        : undefined;
    expect(refreshCookie).toBeDefined();
  });

  it("should issue a different access token after refresh", async () => {
    const { authUser, cookies } = await AuthHelper.getAuthenticatedUser();

    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", cookies!)
      .expect(200);

    expect(response.body.data.session.accessToken).not.toBe(
      authUser.session.accessToken,
    );
  });

  // ── Missing Token ─────────────────────────────────────────────────────────

  it("should return 401 when no refresh token cookie is sent", async () => {
    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.MISSING_REFRESH_TOKEN);
  });

  // ── Invalid Token ─────────────────────────────────────────────────────────

  it("should return 401 when refresh token is invalid", async () => {
    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", "refreshToken=completely_invalid_token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);
  });

  // ── Expired Token ─────────────────────────────────────────────────────────

  it("should return 401 when refresh token is expired", async () => {
    const { authUser, cookies } = await AuthHelper.getAuthenticatedUser();
    await SessionFactory.update(authUser.session.id, {
      expiresAt: subDays(new Date(), 1),
    });

    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", cookies!)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.EXPIRED_REFRESH_TOKEN);
  });

  // ── Revoked Token ─────────────────────────────────────────────────────────

  it("should return 401 when session is revoked", async () => {
    const { authUser, cookies } = await AuthHelper.getAuthenticatedUser();
    await SessionFactory.update(authUser.session.id, {
      revokedAt: new Date(),
    });

    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", cookies!)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.REVOKED_REFRESH_TOKEN);
  });

  // ── Deleted / Banned User ─────────────────────────────────────────────────

  it("should return 401 when user is soft-deleted", async () => {
    const { authUser, cookies } = await AuthHelper.getAuthenticatedUser();
    await UserFactory.update(authUser.user.id, {
      deletedAt: new Date(),
    });

    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", cookies!)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("should return 401 when user is banned", async () => {
    const { authUser, cookies } = await AuthHelper.getAuthenticatedUser();
    await UserFactory.update(authUser.user.id, {
      isBanned: true,
    });

    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", cookies!)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  // ── Old Token After Rotation ──────────────────────────────────────────────

  it("should reject the old refresh token after a successful rotation", async () => {
    const { cookies } = await AuthHelper.getAuthenticatedUser();

    // First refresh - should succeed
    await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", cookies!)
      .expect(200);

    // Second refresh with old cookie - should fail because token hash changed
    const response = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", cookies!)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);
  });
});
