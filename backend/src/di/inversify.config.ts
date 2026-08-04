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
import MovieRepository from "@/modules/movie/data/repository/movie.repository";
import TheaterRepository from "@/modules/movie/data/repository/theater.repository";
import StreamingTheaterRepository from "@/modules/movie/data/repository/streaming-theater.repository";
import TheaterStreamingMapper from "@/modules/movie/data/mapper/streaming-theater.mapper";
import MovieListingRouter from "@/modules/movie/api/router/movie-listing.router";
import MovieListingController from "@/modules/movie/api/controller/movie-listing.controller";
import MovieListingService from "@/modules/movie/domain/service/movie-listing.service";
import MovieRouter from "@/modules/movie/api/router/movie.router";
import TheaterSeatInventoryMapper from "@/modules/movie/data/mapper/theater-seat-inventory.mapper";
import TheaterSeatInventoryRepository from "@/modules/movie/data/repository/theater-seat-inventory.repository";
import MovieBookingService from "@/modules/movie/domain/service/movie-booking.service";
import MovieBookingController from "@/modules/movie/api/controller/movie-booking.controller";
import MovieBookingRouter from "@/modules/movie/api/router/movie-booking.router";

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

// Movie Module
container.bind(TYPES.MovieRepository).to(MovieRepository).inSingletonScope();
container
  .bind(TYPES.TheaterRepository)
  .to(TheaterRepository)
  .inSingletonScope();
container
  .bind(TYPES.StreamingTheaterRepository)
  .to(StreamingTheaterRepository)
  .inSingletonScope();
container
  .bind(TYPES.StreamingTheaterMapper)
  .to(TheaterStreamingMapper)
  .inSingletonScope();
container
  .bind(TYPES.MovieListingController)
  .to(MovieListingController)
  .inSingletonScope();
container
  .bind(TYPES.MovieListingRouter)
  .to(MovieListingRouter)
  .inSingletonScope();
container
  .bind(TYPES.MovieListingService)
  .to(MovieListingService)
  .inSingletonScope();
container
  .bind(TYPES.TheaterSeatInventoryMapper)
  .to(TheaterSeatInventoryMapper)
  .inSingletonScope();
container
  .bind(TYPES.TheaterSeatInventoryRepository)
  .to(TheaterSeatInventoryRepository)
  .inSingletonScope();
container
  .bind(TYPES.MovieBookingService)
  .to(MovieBookingService)
  .inSingletonScope();
container
  .bind(TYPES.MovieBookingController)
  .to(MovieBookingController)
  .inSingletonScope();
container
  .bind(TYPES.MovieBookingRouter)
  .to(MovieBookingRouter)
  .inSingletonScope();
container.bind(TYPES.MovieRouter).to(MovieRouter).inSingletonScope();


export default container;
