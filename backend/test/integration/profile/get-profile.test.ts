import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import app from "@/app";
import ProfileFactory from "../../factories/profile.factory";
import { Gender } from "@/modules/profile/entity/profile.entity";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

describe("GET /api/profile", () => {
  const PROFILE_PATH = "/api/profile";

  beforeEach(async () => {
    await resetDb();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  it("should return 200 with profile and user data when profile exists", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
      avatarUrl: "https://example.com/avatar.png",
    });

    const res = await request(app)
      .get(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id", authUser.user.id);
    expect(res.body.data).toHaveProperty("fullname", "Peter Parker");
    expect(res.body.data).toHaveProperty("gender", Gender.MALE);
    expect(res.body.data).toHaveProperty("avatarUrl", "https://example.com/avatar.png");
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user.email).toBe(authUser.user.email);
  });

  // ── Profile Not Found ─────────────────────────────────────────────────────

  it("should return 404 when profile has not been created", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .get(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
  });

  // ── Authentication Errors ─────────────────────────────────────────────────

  it("should return 401 when Authorization header is missing", async () => {
    const res = await request(app)
      .get(PROFILE_PATH)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  it("should return 401 when access token is invalid", async () => {
    const res = await request(app)
      .get(PROFILE_PATH)
      .set("Authorization", "Bearer invalid_token")
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });
});
