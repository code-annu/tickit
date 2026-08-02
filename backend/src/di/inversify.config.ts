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
import ProfileRepository from "@/modules/profile/repository/profile.repository";
import ProfileService from "@/modules/profile/profile.service";
import ProfileController from "@/modules/profile/api/profile.controller";
import ProfileRouter from "@/modules/profile/api/profile.router";
import ProfileMapper from "@/modules/profile/mapper/profile.mapper";
import MovieRepository from "@/modules/movie_booking/repository/movie.repository";
import MovieService from "@/modules/movie_booking/service/movie.service";
import TheaterRepository from "@/modules/movie_booking/repository/theater.repository";
import TheaterService from "@/modules/movie_booking/service/theater.service";
import MovieBookingController from "@/modules/movie_booking/api/movie-booking.controller";
import MovieBookingRouter from "@/modules/movie_booking/api/movie-booking.router";
import TheaterStreamingService from "@/modules/movie_booking/service/theater-streaming.service";
import TheaterStreamingRepository from "@/modules/movie_booking/repository/theater-streaming.repository";
import TheaterStreamingMapper from "@/modules/movie_booking/mapper/theater-streaming.mapper";

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

// Profile Module
container
  .bind(TYPES.ProfileRepository)
  .to(ProfileRepository)
  .inSingletonScope();
container.bind(TYPES.ProfileService).to(ProfileService).inSingletonScope();
container
  .bind(TYPES.ProfileController)
  .to(ProfileController)
  .inSingletonScope();
container.bind(TYPES.ProfileRouter).to(ProfileRouter).inSingletonScope();
container.bind(TYPES.ProfileMapper).to(ProfileMapper).inSingletonScope();

// Movie Booking Module
container.bind(TYPES.MovieRepository).to(MovieRepository).inSingletonScope();
container.bind(TYPES.MovieService).to(MovieService).inSingletonScope();
container
  .bind(TYPES.TheaterRepository)
  .to(TheaterRepository)
  .inSingletonScope();
container.bind(TYPES.TheaterService).to(TheaterService).inSingletonScope();
container
  .bind(TYPES.MovieBookingController)
  .to(MovieBookingController)
  .inSingletonScope();
container
  .bind(TYPES.MovieBookingRouter)
  .to(MovieBookingRouter)
  .inSingletonScope();
container
  .bind(TYPES.TheaterStreamingService)
  .to(TheaterStreamingService)
  .inSingletonScope();
container
  .bind(TYPES.TheaterStreamingRepository)
  .to(TheaterStreamingRepository)
  .inSingletonScope();
container
  .bind(TYPES.TheaterStreamingMapper)
  .to(TheaterStreamingMapper)
  .inSingletonScope();

export default container;
