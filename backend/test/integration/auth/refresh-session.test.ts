import app from "@/app";
import crypto from "crypto";
import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import UserFactory from "../../factories/user.factory";
import SessionFactory from "../../factories/session.factory";
import AuthHelper from "../../helpers/auth.helper";
import AuthErrorCode from "@/modules/auth/error/AuthErrorCode";
import { addDays, subDays } from "date-fns";

const API = "/api/auth/refresh";

/** Extracts the refresh token cookie string from a set-cookie header or array */
function extractRefreshCookie(cookies: any): string | undefined {
  if (!cookies) return undefined;
  const arr = Array.isArray(cookies) ? cookies : [cookies];
  return arr.find((c: string) => c.startsWith("refreshToken="));
}

/** Extracts the raw refresh token value from the cookie header */
function extractRefreshTokenValue(cookieStr: string): string {
  const match = cookieStr.match(/refreshToken=([^;]+)/);
  return match ? match[1]! : "";
}

beforeEach(async () => {
  await resetDb();
});

describe("POST /api/auth/refresh", () => {
  // ─── Happy path ────────────────────────────────────────────
  describe("Success", () => {
    it("should return 200 with new tokens when refresh token is valid", async () => {
      const { authUser, cookies } = await AuthHelper.getAuthenticatedUser();
      const cookie = extractRefreshCookie(cookies);
      expect(cookie).toBeDefined();

      const tokenValue = extractRefreshTokenValue(cookie!);

      const res = await request(app)
        .post(API)
        .set("Cookie", [cookie!])
        .send({ token: tokenValue })
        .expect(200);

      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("session");
      expect(res.body.session).toHaveProperty("accessToken");
      expect(res.body.user.email).toBe(authUser.user.email);

      // New refresh cookie should be set
      const newCookie = extractRefreshCookie(res.headers["set-cookie"]);
      expect(newCookie).toBeDefined();
    });

    it("should rotate the refresh token (old token becomes invalid)", async () => {
      const { cookies } = await AuthHelper.getAuthenticatedUser();
      const cookie = extractRefreshCookie(cookies);
      const oldTokenValue = extractRefreshTokenValue(cookie!);

      // First refresh — should succeed
      await request(app)
        .post(API)
        .set("Cookie", [cookie!])
        .send({ token: oldTokenValue })
        .expect(200);

      // Old token in DB should no longer exist since tokenHash was rotated
      const oldTokenHash = crypto
        .createHash("sha256")
        .update(oldTokenValue)
        .digest("hex");
      const oldSession = await SessionFactory.findByTokenHash(oldTokenHash);
      expect(oldSession).toBeNull();
    });

    it("should return a new access token different from the previous one", async () => {
      const { authUser, cookies } = await AuthHelper.getAuthenticatedUser();
      const cookie = extractRefreshCookie(cookies);
      const tokenValue = extractRefreshTokenValue(cookie!);

      const res = await request(app)
        .post(API)
        .set("Cookie", [cookie!])
        .send({ token: tokenValue })
        .expect(200);

      expect(res.body.session.accessToken).not.toBe(
        authUser.session.accessToken,
      );
    });
  });

  // ─── Missing token ────────────────────────────────────────
  describe("Missing token", () => {
    it("should return 401 when no refresh token is provided", async () => {
      const res = await request(app).post(API).send({}).expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.MISSING_REFRESH_TOKEN);
    });

    it("should return 401 when token is null", async () => {
      const res = await request(app)
        .post(API)
        .send({ token: null })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.MISSING_REFRESH_TOKEN);
    });
  });

  // ─── Invalid token ────────────────────────────────────────
  describe("Invalid token", () => {
    it("should return 401 when refresh token does not match any session", async () => {
      const res = await request(app)
        .post(API)
        .send({ token: "totally-fake-token-that-doesnt-exist" })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);
    });
  });

  // ─── Expired token ────────────────────────────────────────
  describe("Expired token", () => {
    it("should return 401 when refresh token session is expired", async () => {
      const user = await UserFactory.createUser("expired@example.com", "Peter@1234");
      const rawToken = crypto.randomBytes(64).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      await SessionFactory.createSession(user.id, {
        tokenHash,
        expiresAt: subDays(new Date(), 1), // expired yesterday
      });

      const res = await request(app)
        .post(API)
        .send({ token: rawToken })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.EXPIRED_REFRESH_TOKEN);
    });
  });

  // ─── Revoked token ────────────────────────────────────────
  describe("Revoked token", () => {
    it("should return 401 when refresh token session is revoked", async () => {
      const user = await UserFactory.createUser("revoked@example.com", "Peter@1234");
      const rawToken = crypto.randomBytes(64).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      await SessionFactory.createSession(user.id, {
        tokenHash,
        expiresAt: addDays(new Date(), 7),
        revokedAt: new Date(),
      });

      const res = await request(app)
        .post(API)
        .send({ token: rawToken })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.REVOKED_REFRESH_TOKEN);
    });
  });

  // ─── Banned / deleted user ────────────────────────────────
  describe("Banned / deleted user", () => {
    it("should return 401 when user is banned", async () => {
      const user = await UserFactory.createUser("banned@example.com", "Peter@1234");
      const rawToken = crypto.randomBytes(64).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      await SessionFactory.createSession(user.id, {
        tokenHash,
        expiresAt: addDays(new Date(), 7),
      });
      await UserFactory.update(user.id, { isBanned: true });

      const res = await request(app)
        .post(API)
        .send({ token: rawToken })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it("should return 401 when user is soft-deleted", async () => {
      const user = await UserFactory.createUser("deleted@example.com", "Peter@1234");
      const rawToken = crypto.randomBytes(64).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      await SessionFactory.createSession(user.id, {
        tokenHash,
        expiresAt: addDays(new Date(), 7),
      });
      await UserFactory.update(user.id, { deletedAt: new Date() });

      const res = await request(app)
        .post(API)
        .send({ token: rawToken })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });
  });
});
