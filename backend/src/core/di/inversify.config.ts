import "reflect-metadata";
import { Container } from "inversify";
import TYPES from "./inversify.types";

// Shared / Util imports
import JWTUtil from "@/shared/util/jwt.util";
import ClientInfoUtil from "@/shared/util/client-info.util";

// Auth imports
import AuthMapper from "@/modules/auth/mapper/auth.mapper";
import UserRepository from "@/modules/auth/repository/user.repository";
import SessionRepository from "@/modules/auth/repository/session.repository";
import AuthService from "@/modules/auth/auth.service";
import AuthResponse from "@/modules/auth/auth.response";
import AuthController from "@/modules/auth/auth.controller";
import AuthRouter from "@/modules/auth/auth.router";

const container = new Container();

// Util bindings
container.bind<JWTUtil>(TYPES.JWTUtil).to(JWTUtil);
container.bind<ClientInfoUtil>(TYPES.ClientInfoUtil).to(ClientInfoUtil);

// Auth bindings
container.bind<AuthMapper>(TYPES.AuthMapper).to(AuthMapper);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container
  .bind<SessionRepository>(TYPES.SessionRepository)
  .to(SessionRepository);
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<AuthResponse>(TYPES.AuthResponse).to(AuthResponse);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<AuthRouter>(TYPES.AuthRouter).to(AuthRouter);

export default container;
