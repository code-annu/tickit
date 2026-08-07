import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import app from "@/app";
import ProfileFactory from "../../factories/profile.factory";
import { Gender } from "@/modules/profile/entity/profile.entity";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";
import ErrorCode from "@/core/error/ErrorCode";

describe("POST /api/profile", () => {
  const PROFILE_PATH = "/api/profile";

  beforeEach(async () => {
    await resetDb();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  it("should create a profile successfully and return 201 with profile data", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();
    const profileData = {
      fullname: "Peter Parker",
      gender: "MALE",
      avatarUrl: "https://example.com/avatar.png",
      dob: "2000-01-01",
    };

    const res = await request(app)
      .post(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id", authUser.user.id);
    expect(res.body.data).toHaveProperty("fullname", profileData.fullname);
    expect(res.body.data).toHaveProperty("gender", profileData.gender);
    expect(res.body.data).toHaveProperty("avatarUrl", profileData.avatarUrl);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user.email).toBe(authUser.user.email);
  });

  it("should persist created profile in the database", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();
    const profileData = {
      fullname: "Peter Parker",
      gender: "MALE",
    };

    await request(app)
      .post(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(201);

    const savedProfile = await ProfileFactory.findById(authUser.user.id);
    expect(savedProfile).not.toBeNull();
    expect(savedProfile?.fullname).toBe("Peter Parker");
    expect(savedProfile?.gender).toBe(Gender.MALE);
  });

  // ── Authentication Errors ─────────────────────────────────────────────────

  it("should return 401 when Authorization header is missing", async () => {
    const res = await request(app)
      .post(PROFILE_PATH)
      .send({ fullname: "Peter Parker", gender: "MALE" })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  it("should return 401 when access token is invalid", async () => {
    const res = await request(app)
      .post(PROFILE_PATH)
      .set("Authorization", "Bearer invalid_token")
      .send({ fullname: "Peter Parker", gender: "MALE" })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });

  // ── Conflict / Duplicate ──────────────────────────────────────────────────

  it("should return 409 when profile already exists for the user", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const res = await request(app)
      .post(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send({ fullname: "Peter Parker", gender: "MALE" })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ProfileErrorCode.PROFILE_ALREADY_EXISTS);
  });

  // ── Validation Errors ─────────────────────────────────────────────────────

  it("should return 400 when fullname is too short", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .post(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send({ fullname: "Ab", gender: "MALE" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when fullname is empty", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .post(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send({ fullname: "", gender: "MALE" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when gender is invalid", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .post(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send({ fullname: "Peter Parker", gender: "INVALID" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("should return 400 when avatarUrl is not a valid URL", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .post(PROFILE_PATH)
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send({ fullname: "Peter Parker", gender: "MALE", avatarUrl: "not-a-url" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });
});
