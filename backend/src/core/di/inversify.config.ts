import "reflect-metadata";
import { Container } from "inversify";
import TYPES from "./inversify.types";

// Shared / Util imports
import JWTUtil from "@/shared/util/jwt.util";
import ClientInfoUtil from "@/shared/util/client-info.util";
import UserRepository from "@/shared/user/repository/user.repository";
import UserService from "@/shared/user/user.service";

// Auth imports
import SessionRepository from "@/modules/auth/repository/session.repository";
import AuthService from "@/modules/auth/auth.service";
import AuthController from "@/modules/auth/auth.controller";
import AuthRouter from "@/modules/auth/auth.router";

// Profile imports
import ProfileMapper from "@/modules/profile/mapper/profile.mapper";
import ProfileRepository from "@/modules/profile/repository/profile.repository";
import ProfileService from "@/modules/profile/profile.service";
import ProfileController from "@/modules/profile/profile.controller";
import ProfileRouter from "@/modules/profile/profile.router";

// Movie imports
import MovieRepository from "@/modules/movie/repository/movie.repository";
import MovieShowRepository from "@/modules/movie/repository/movie-show.repository";
import MovieShowMapper from "@/modules/movie/mapper/movie-show.mapper";
import MovieService from "@/modules/movie/movie.service";
import MovieController from "@/modules/movie/movie.controller";
import MovieRouter from "@/modules/movie/movie.router";

// Theater imports
import TheaterRepository from "@/modules/theater/repository/theater.repository";
import TheaterShowRepository from "@/modules/theater/repository/theater-show.repository";
import TheaterShowMapper from "@/modules/theater/mapper/theater-show.mapper";
import TheaterService from "@/modules/theater/theater.service";
import TheaterController from "@/modules/theater/theater.controller";
import TheaterRouter from "@/modules/theater/theater.router";

// Show imports
import ShowMapper from "@/modules/show/show.mapper";
import ShowRepository from "@/modules/show/repository/show.repository";
import ShowService from "@/modules/show/show.service";
import ShowResponse from "@/modules/show/show.response";
import ShowController from "@/modules/show/show.controller";
import ShowRouter from "@/modules/show/show.router";

const container = new Container();

// Util bindings
container.bind<JWTUtil>(TYPES.JWTUtil).to(JWTUtil);
container.bind<ClientInfoUtil>(TYPES.ClientInfoUtil).to(ClientInfoUtil);

// User bindings
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<UserService>(TYPES.UserService).to(UserService);

// Auth bindings
container
  .bind<SessionRepository>(TYPES.SessionRepository)
  .to(SessionRepository);
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<AuthRouter>(TYPES.AuthRouter).to(AuthRouter);

// Profile bindings
container.bind<ProfileMapper>(TYPES.ProfileMapper).to(ProfileMapper);
container
  .bind<ProfileRepository>(TYPES.ProfileRepository)
  .to(ProfileRepository);
container.bind<ProfileService>(TYPES.ProfileService).to(ProfileService);
container
  .bind<ProfileController>(TYPES.ProfileController)
  .to(ProfileController);
container.bind<ProfileRouter>(TYPES.ProfileRouter).to(ProfileRouter);

// Movie bindings
container.bind<MovieShowMapper>(TYPES.MovieShowMapper).to(MovieShowMapper);
container.bind<MovieRepository>(TYPES.MovieRepository).to(MovieRepository);
container
  .bind<MovieShowRepository>(TYPES.MovieShowRepository)
  .to(MovieShowRepository);
container.bind<MovieService>(TYPES.MovieService).to(MovieService);
container.bind<MovieController>(TYPES.MovieController).to(MovieController);
container.bind<MovieRouter>(TYPES.MovieRouter).to(MovieRouter);

// Theater bindings
container
  .bind<TheaterShowMapper>(TYPES.TheaterShowMapper)
  .to(TheaterShowMapper);
container
  .bind<TheaterRepository>(TYPES.TheaterRepository)
  .to(TheaterRepository);
container
  .bind<TheaterShowRepository>(TYPES.TheaterShowRepository)
  .to(TheaterShowRepository);
container.bind<TheaterService>(TYPES.TheaterService).to(TheaterService);
container
  .bind<TheaterController>(TYPES.TheaterController)
  .to(TheaterController);
container.bind<TheaterRouter>(TYPES.TheaterRouter).to(TheaterRouter);

// Show bindings
container.bind<ShowMapper>(TYPES.ShowMapper).to(ShowMapper);
container.bind<ShowRepository>(TYPES.ShowRepository).to(ShowRepository);
container.bind<ShowService>(TYPES.ShowService).to(ShowService);
container.bind<ShowResponse>(TYPES.ShowResponse).to(ShowResponse);
container.bind<ShowController>(TYPES.ShowController).to(ShowController);
container.bind<ShowRouter>(TYPES.ShowRouter).to(ShowRouter);

export default container;
