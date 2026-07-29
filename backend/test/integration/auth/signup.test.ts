import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import app from "@/app";
import UserFactory from "../../factories/user.factory";
import UserErrorCode from "@/shared/user/UserErrorCode";
import ErrorCode from "@/shared/error/ErrorCode";

describe("Signup", () => {
  beforeEach(async () => {
    await resetDb();
  });

  const SIGNUP_PATH = "/api/auth/signup";

  it("Should signup successfully", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(201);

    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
  });

  it("Should reject for already duplicate email", async () => {
    await UserFactory.createUser("peter@gmail.com", "Peter@1234");
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(409);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.EMAIL_ALREADY_EXISTS);
  });

  it("Should reject for bad request body", async () => {
    const response = await request(app)
      .post(SIGNUP_PATH)
      .send({
        email: "peter",
        password: "Peter234",
      })
      .expect(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });
});
