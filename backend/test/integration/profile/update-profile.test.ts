import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import app from "@/app";
import ProfileFactory from "../../factories/profile.factory";
import { Gender } from "@/modules/profile/entity/profile.entity";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";
import ErrorCode from "@/shared/error/ErrorCode";

describe("Update profile", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("Should update profile", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const profileData = {
      fullname: "Peter Parker Updated",
      gender: Gender.FEMALE,
    };

    const res = await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.fullname).toBe(profileData.fullname);
    expect(res.body.data.gender).toBe(profileData.gender);
  });

  it("Should not update profile when not found", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const profileData = {
      fullname: "Peter Parker Updated",
      gender: Gender.FEMALE,
    };

    const res = await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(404);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
  });

  it("Should not update profile for invalid profile data", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const profileData = {
      fullname: "P",
      gender: "INVALID",
    };

    const res = await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(400);

    console.log(res.body.error.details);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });
});
