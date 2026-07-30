import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helper";
import app from "@/app";
import ProfileFactory from "../../factories/profile.factory";
import { Gender } from "@/modules/profile/entity/profile.entity";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";

describe("Delete profile", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("Should delete profile", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    await ProfileFactory.createProfile(authUser.user.id, {
      fullname: "Peter Parker",
      gender: Gender.MALE,
    });

    const res = await request(app)
      .delete("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(204);

    expect(res.body).toEqual({});
  });

  it("Should not delete profile when not found", async () => {
    const { authUser } = await AuthHelper.getAuthenticatedUser();

    const res = await request(app)
      .delete("/api/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .expect(404);

    expect(res.body.success).toBeFalsy();
    expect(res.body.error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
  });
});
