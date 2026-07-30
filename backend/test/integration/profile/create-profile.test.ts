import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import app from "@/app";
import ProfileFactory from "../../factories/profile.factory";
import { Gender } from "@/modules/profile/entity/profile.entity";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";
import ErrorCode from "@/shared/error/ErrorCode";

describe("Create profile", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("Should create profile", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();
    const profileData = {
      fullname: "Peter Parker",
      gender: "MALE",
    };

    const res = await request(app)
      .post("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(201);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("id");
  });

  it("Should not create profile for invalid profile data", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();
    const profileData = {
      fullname: "",
      gender: "male",
    };

    const res = await request(app)
      .post("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(400);

    console.log(res.body.error.details);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("Should not create profile for already created profile", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();
    const profileData = {
      fullname: "Peter Parker",
      gender: "MALE",
    };

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: profileData.fullname,
      gender: profileData.gender as Gender,
    });

    const res = await request(app)
      .post("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(409);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ProfileErrorCode.PROFILE_ALREADY_EXISTS);
  });
});
