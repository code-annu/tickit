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

// Movie imports
import MovieMapper from "@/modules/movie/movie.mapper";
import MovieRepository from "@/modules/movie/repository/movie.repository";
import MovieService from "@/modules/movie/movie.service";
import MovieResponse from "@/modules/movie/movie.response";
import MovieController from "@/modules/movie/movie.controller";
import MovieRouter from "@/modules/movie/movie.router";

// Theater imports
import TheaterMapper from "@/modules/theater/theater.mapper";
import TheaterRepository from "@/modules/theater/repository/theater.repository";
import TheaterService from "@/modules/theater/theater.service";
import TheaterResponse from "@/modules/theater/theater.response";
import TheaterController from "@/modules/theater/theater.controller";
import TheaterRouter from "@/modules/theater/theater.router";

// Show imports
import ShowMapper from "@/modules/show/show.mapper";
import ShowRepository from "@/modules/show/repository/show.repository";
import SeatHoldRepository from "@/modules/show/repository/seat-hold.repository";
import ShowService from "@/modules/show/show.service";
import ShowResponse from "@/modules/show/show.response";
import ShowController from "@/modules/show/show.controller";
import ShowRouter from "@/modules/show/show.router";

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

// Movie bindings
container.bind<MovieMapper>(TYPES.MovieMapper).to(MovieMapper);
container.bind<MovieRepository>(TYPES.MovieRepository).to(MovieRepository);
container.bind<MovieService>(TYPES.MovieService).to(MovieService);
container.bind<MovieResponse>(TYPES.MovieResponse).to(MovieResponse);
container.bind<MovieController>(TYPES.MovieController).to(MovieController);
container.bind<MovieRouter>(TYPES.MovieRouter).to(MovieRouter);

// Theater bindings
container.bind<TheaterMapper>(TYPES.TheaterMapper).to(TheaterMapper);
container
  .bind<TheaterRepository>(TYPES.TheaterRepository)
  .to(TheaterRepository);
container.bind<TheaterService>(TYPES.TheaterService).to(TheaterService);
container.bind<TheaterResponse>(TYPES.TheaterResponse).to(TheaterResponse);
container
  .bind<TheaterController>(TYPES.TheaterController)
  .to(TheaterController);
container.bind<TheaterRouter>(TYPES.TheaterRouter).to(TheaterRouter);

// Show bindings
container.bind<ShowMapper>(TYPES.ShowMapper).to(ShowMapper);
container.bind<ShowRepository>(TYPES.ShowRepository).to(ShowRepository);
container
  .bind<SeatHoldRepository>(TYPES.SeatHoldRepository)
  .to(SeatHoldRepository);
container.bind<ShowService>(TYPES.ShowService).to(ShowService);
container.bind<ShowResponse>(TYPES.ShowResponse).to(ShowResponse);
container.bind<ShowController>(TYPES.ShowController).to(ShowController);
container.bind<ShowRouter>(TYPES.ShowRouter).to(ShowRouter);

export default container;

