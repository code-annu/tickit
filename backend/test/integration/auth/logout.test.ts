import app from "@/app";
import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import SessionFactory from "../../factories/session.factory";
import AuthHelper from "../../helpers/auth.helper";
import AuthErrorCode from "@/modules/auth/error/AuthErrorCode";

const API = "/api/auth/logout";

beforeEach(async () => {
  await resetDb();
});

describe("POST /api/auth/logout", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 204 and revoke the session", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken, id: sessionId } = authUser.session;

      await request(app)
        .post(API)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);

      // Session should be revoked in the DB
      const session = await SessionFactory.findById(sessionId);
      expect(session).not.toBeNull();
      expect(session!.revokedAt).not.toBeNull();
    });

    it("should clear the refresh token cookie", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken } = authUser.session;

      const res = await request(app)
        .post(API)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const refreshCookie = Array.isArray(cookies)
        ? cookies.find((c: string) => c.startsWith("refreshToken="))
        : cookies;
      expect(refreshCookie).toBeDefined();
      // Cleared cookie has empty value or max-age=0 / expires in the past
      expect(refreshCookie).toMatch(
        /refreshToken=;|Expires=Thu, 01 Jan 1970/i,
      );
    });

    it("should not return a body", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken } = authUser.session;

      const res = await request(app)
        .post(API)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);

      // 204 responses should have empty body
      expect(res.body).toEqual({});
    });
  });

  // ─── Missing / invalid access token ───────────────────────
  describe("Authentication", () => {
    it("should return 401 when no Authorization header is provided", async () => {
      const res = await request(app).post(API).expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
    });

    it("should return 401 when Authorization header has no Bearer prefix", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken } = authUser.session;

      const res = await request(app)
        .post(API)
        .set("Authorization", accessToken)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
    });

    it("should return 401 when access token is invalid", async () => {
      const res = await request(app)
        .post(API)
        .set("Authorization", "Bearer invalid.jwt.token")
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
    });

    it("should return 401 when access token is expired / tampered", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken } = authUser.session;
      const tamperedToken = accessToken.slice(0, -5) + "XXXXX";

      const res = await request(app)
        .post(API)
        .set("Authorization", `Bearer ${tamperedToken}`)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
    });
  });

  // ─── Idempotency ──────────────────────────────────────────
  describe("Idempotency", () => {
    it("should handle double-logout gracefully (session already revoked)", async () => {
      const { authUser } = await AuthHelper.getAuthenticatedUser();
      const { accessToken } = authUser.session;

      // First logout
      await request(app)
        .post(API)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);

      // Second logout with same token — session already revoked.
      // The auth middleware verifies the JWT (which is still valid until it expires),
      // and the revoke operation is a no-op (updateMany where revokedAt is null).
      await request(app)
        .post(API)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);
    });
  });
});
