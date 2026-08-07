import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import app from "@/app";
import ProfileFactory from "../../factories/profile.factory";
import UserFactory from "../../factories/user.factory";
import { Gender } from "@/modules/profile/entity/profile.entity";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

describe("DELETE /api/profile", () => {
  const PROFILE_PATH = "/api/profile";

  beforeEach(async () => {
    await resetDb();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  it("should delete profile and return 204", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const res = await request(app)
      .delete(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(204);

    expect(res.body).toEqual({});
  });

  it("should soft delete user in the database after profile deletion", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    await request(app)
      .delete(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(204);

    const deletedUser = await UserFactory.findById(authUser.user.id);
    expect(deletedUser).not.toBeNull();
    expect(deletedUser?.deletedAt).not.toBeNull();
  });

  // ── Profile Not Found ─────────────────────────────────────────────────────

  it("should return 404 when profile to delete is not found", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .delete(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
  });

  // ── Authentication Errors ─────────────────────────────────────────────────

  it("should return 401 when Authorization header is missing", async () => {
    const res = await request(app)
      .delete(PROFILE_PATH)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  it("should return 401 when access token is invalid", async () => {
    const res = await request(app)
      .delete(PROFILE_PATH)
      .set("Authorization", "Bearer invalid_token")
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });
});
