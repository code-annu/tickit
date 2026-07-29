import { resetDb } from "../../helpers/cleanup";
import request from "supertest";
import app from "@/app";
import AuthHelper from "../../helpers/auth.helper";

describe("Logout", () => {
  beforeEach(async () => {
    await resetDb();
  });

  const LOGOUT_PATH = "/api/auth/logout";

  it("Should logout successfully", async () => {
    const result = await AuthHelper.getAuthenticatedUser();
    await request(app)
      .post(LOGOUT_PATH)
      .set({ authorization: `Bearer ${result.authUser.session.accessToken}` })
      .expect(204);
  });
});
