import { resetDb } from "../../helpers/cleanup";
import request from "supertest";
import app from "@/app";
import AuthHelper from "../../helpers/auth.helper";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

describe("Authenticate middleware", () => {
  beforeEach(async () => {
    await resetDb();
  });

  const LOGOUT_PATH = "/api/auth/logout";

  it("Should reject for missing access token", async () => {
    const response = await request(app).post(LOGOUT_PATH).expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.MISSING_ACCESS_TOKEN);
  });

  it("Should reject for invalid access token", async () => {
    await AuthHelper.getAuthenticatedUser();
    const response = await request(app)
      .post(LOGOUT_PATH)
      .set({ authorization: `Bearer invalid` })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });
});
