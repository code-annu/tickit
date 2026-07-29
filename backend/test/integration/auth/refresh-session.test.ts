import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import app from "@/app";
import AuthHelper from "../../helpers/auth.helper";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";
import SessionFactory from "../../factories/session.factory";
import { subDays } from "date-fns";
import UserFactory from "../../factories/user.factory";

describe("Refresh session", () => {
  const REFRESH_SESSION_PATH = "/api/auth/refresh-session";

  beforeEach(async () => {
    await resetDb();
  });

  it("Should refresh session successfully", async () => {
    const result = await AuthHelper.getAuthenticatedUser();
    const res = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", result.cookies!)
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty("session");
    expect(res.body.data).toHaveProperty("user");
  });

  it("Should reject for missing refresh token", async () => {
    const res = await request(app).post(REFRESH_SESSION_PATH).expect(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(AuthErrorCode.MISSING_REFRESH_TOKEN);
  });

  it("Should reject for invalid token", async () => {
    await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", "refreshToken=invalid")
      .expect(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);
  });

  it("Should reject for expired token", async () => {
    const result = await AuthHelper.getAuthenticatedUser();
    await SessionFactory.update(result.authUser.session.id, {
      expiresAt: subDays(new Date(), 1),
    });

    const res = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", result.cookies!)
      .expect(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(AuthErrorCode.EXPIRED_REFRESH_TOKEN);
  });

  it("Should reject for revoked token", async () => {
    const result = await AuthHelper.getAuthenticatedUser();
    await SessionFactory.update(result.authUser.session.id, {
      revokedAt: new Date(),
    });

    const res = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", result.cookies!)
      .expect(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(AuthErrorCode.REVOKED_REFRESH_TOKEN);
  });

  it("Should reject for deleted user", async () => {
    const result = await AuthHelper.getAuthenticatedUser();
    await UserFactory.update(result.authUser.user.id, {
      deletedAt: new Date(),
    });

    const res = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", result.cookies!)
      .expect(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for banned user", async () => {
    const result = await AuthHelper.getAuthenticatedUser();
    await UserFactory.update(result.authUser.user.id, {
      isBanned: true,
    });

    const res = await request(app)
      .post(REFRESH_SESSION_PATH)
      .set("Cookie", result.cookies!)
      .expect(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });
});
