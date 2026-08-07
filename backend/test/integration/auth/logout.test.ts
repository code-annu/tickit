import { resetDb } from "../../helpers/cleanup";
import request from "supertest";
import app from "@/app";
import AuthHelper from "../../helpers/auth.helper";
import SessionFactory from "../../factories/session.factory";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

describe("POST /api/auth/logout", () => {
  const LOGOUT_PATH = "/api/auth/logout";

  beforeEach(async () => {
    await resetDb();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  it("should logout successfully and return 204", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await request(app)
      .post(LOGOUT_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(204);
  });

  it("should revoke the session in the database after logout", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await request(app)
      .post(LOGOUT_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(204);

    const session = await SessionFactory.findById(authUser.session.id);
    expect(session).not.toBeNull();
    expect(session!.revokedAt).not.toBeNull();
  });

  it("should prevent refresh after logout (revoked session)", async () => {
    const { authUser, cookies } = await AuthHelper.getAuthenticatedUser();

    // Logout
    await request(app)
      .post(LOGOUT_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(204);

    // Try to refresh — should fail because session is revoked
    const refreshResponse = await request(app)
      .post("/api/auth/refresh-session")
      .set("Cookie", cookies!)
      .expect(401);

    expect(refreshResponse.body.success).toBe(false);
    expect(refreshResponse.body.error.code).toBe(
      AuthErrorCode.REVOKED_REFRESH_TOKEN,
    );
  });

  // ── Auth Required ─────────────────────────────────────────────────────────

  it("should return 401 when no access token is provided", async () => {
    const response = await request(app)
      .post(LOGOUT_PATH)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  it("should return 401 when access token is invalid", async () => {
    const response = await request(app)
      .post(LOGOUT_PATH)
      .set("Authorization", "Bearer invalid_token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });
});
