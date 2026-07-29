import app from "@/app";
import UserFactory from "../factories/user.factory";
import request from "supertest";

interface AuthUser {
  session: { id: string; accessToken: string };
  user: { id: string; email: string; isEmailVerified: boolean };
}

export default abstract class AuthHelper {
  static async getAuthenticatedUser() {
    await UserFactory.createUser("peter@gmail.com", "Peter@1234");
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(200);
    const cookies = response.headers["set-cookie"];

    return {
      authUser: response.body.data,
      cookies,
    };
  }
}
