import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import app from "@/app";
import ProfileFactory from "../../factories/profile.factory";
import { Gender } from "@/modules/profile/entity/profile.entity";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";

describe("Get profile", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("Should get profile", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("id");
  });

  it("Should not get profile when not created", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(404);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
  });
});
