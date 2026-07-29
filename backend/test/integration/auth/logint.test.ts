import app from "@/app";
import { resetDb } from "../../helpers/cleanup";
import request from "supertest";
import UserFactory from "../../factories/user.factory";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";
import ErrorCode from "@/shared/error/ErrorCode";

describe("Login", () => {
  beforeEach(async () => {
    await resetDb();
  });

  const LOGIN_PATH = "/api/auth/login";

  it("Should login successfully", async () => {
    await UserFactory.createUser("peter@gmail.com", "Peter@1234");

    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(200);

    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
  });

  it("Should reject for invalid request body", async () => {
    await UserFactory.createUser("peter@gmail.com", "Peter@1234");
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "pet",
        password: "Peter@123",
      })
      .expect(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });

  it("Should reject for user with email not found", async () => {
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject wrong password", async () => {
    await UserFactory.createUser("peter@gmail.com", "Peter@1234");
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@123",
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for deleted user", async () => {
    const user = await UserFactory.createUser("peter@gmail.com", "Peter@1234");
    await UserFactory.update(user.id, { deletedAt: new Date() });
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for banned user", async () => {
    const user = await UserFactory.createUser("peter@gmail.com", "Peter@1234");
    await UserFactory.update(user.id, { isBanned: true });
    const response = await request(app)
      .post(LOGIN_PATH)
      .send({
        email: "peter@gmail.com",
        password: "Peter@1234",
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });
});
