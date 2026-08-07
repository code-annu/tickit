import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import app from "@/app";
import ProfileFactory from "../../factories/profile.factory";
import { Gender } from "@/modules/profile/entity/profile.entity";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";
import ErrorCode from "@/core/error/ErrorCode";

describe("PATCH /api/profile", () => {
  const PROFILE_PATH = "/api/profile";

  beforeEach(async () => {
    await resetDb();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  it("should update profile successfully and return updated data", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const updateData = {
      fullname: "Peter Parker Updated",
      gender: "FEMALE",
      avatarUrl: "https://example.com/new-avatar.png",
    };

    const res = await request(app)
      .patch(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(updateData)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("fullname", updateData.fullname);
    expect(res.body.data).toHaveProperty("gender", updateData.gender);
    expect(res.body.data).toHaveProperty("avatarUrl", updateData.avatarUrl);
  });

  it("should persist profile updates in the database", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const res = await request(app)
      .patch(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send({ fullname: "Spider Man" })
      .expect(200);

    const updated = await ProfileFactory.findById(authUser.user.id);
    expect(updated?.fullname).toBe("Spider Man");
  });

  // ── Profile Not Found ─────────────────────────────────────────────────────

  it("should return 404 when trying to update a non-existent profile", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .patch(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send({ fullname: "Peter Parker Updated", gender: "FEMALE" })
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
  });

  // ── Authentication Errors ─────────────────────────────────────────────────

  it("should return 401 when Authorization header is missing", async () => {
    const res = await request(app)
      .patch(PROFILE_PATH)
      .send({ fullname: "Peter Parker Updated" })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  it("should return 401 when access token is invalid", async () => {
    const res = await request(app)
      .patch(PROFILE_PATH)
      .set("Authorization", "Bearer invalid_token")
      .send({ fullname: "Peter Parker Updated" })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });

  // ── Validation Errors ─────────────────────────────────────────────────────

  it("should return 400 when fullname is invalid (too short)", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const res = await request(app)
      .patch(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send({ fullname: "A" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when gender is invalid", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const res = await request(app)
      .patch(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send({ gender: "INVALID_GENDER" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });
});
