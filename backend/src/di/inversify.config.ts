import { Container } from "inversify";
import TYPES from "./inversify.types";
import AuthController from "@/modules/auth/api/auth.controller";
import AuthRouter from "@/modules/auth/api/auth.router";
import AuthService from "@/modules/auth/auth.service";
import SessionRepository from "@/modules/auth/repository/session.repository";
import UserRepository from "@/shared/user/repository/user.repository";
import UserService from "@/shared/user/user.service";
import ClientInfoUtil from "@/shared/util/client-info.util";
import JWTUtil from "@/shared/util/jwt.util";

const container = new Container();

// Shared - Utils
container.bind(TYPES.JWTUtil).to(JWTUtil).inSingletonScope();
container.bind(TYPES.ClientInfoUtil).to(ClientInfoUtil).inSingletonScope();

// Shared - User
container.bind(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind(TYPES.UserService).to(UserService).inSingletonScope();

// Auth Module
container
  .bind(TYPES.SessionRepository)
  .to(SessionRepository)
  .inSingletonScope();
container.bind(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind(TYPES.AuthController).to(AuthController).inSingletonScope();
container.bind(TYPES.AuthRouter).to(AuthRouter).inSingletonScope();

export default container;
