const TYPES = {
  // Util types
  ClientInfoUtil: Symbol.for("ClientInfoUtil"),
  JWTUtil: Symbol.for("JWTUtil"),

  // User types
  UserRepository: Symbol.for("UserRepository"),
  UserService: Symbol.for("UserService"),

  // Auth types
  SessionRepository: Symbol.for("SessionRepository"),
  AuthService: Symbol.for("AuthService"),
  AuthController: Symbol.for("AuthController"),
  AuthRouter: Symbol.for("AuthRouter"),

  // Profile types
  ProfileMapper: Symbol.for("ProfileMapper"),
  ProfileRepository: Symbol.for("ProfileRepository"),
  ProfileService: Symbol.for("ProfileService"),
  ProfileController: Symbol.for("ProfileController"),
  ProfileRouter: Symbol.for("ProfileRouter"),

  // Movie Booking types
  MovieRepository: Symbol.for("MovieRepository"),
  MovieService: Symbol.for("MovieService"),
  TheaterRepository: Symbol.for("TheaterRepository"),
  TheaterService: Symbol.for("TheaterService"),
  MovieBookingController: Symbol.for("MovieBookingController"),
  MovieBookingRouter: Symbol.for("MovieBookingRouter"),
  StreamingTheaterRepository: Symbol.for("StreamingTheaterRepository"),
  StreamingTheaterService: Symbol.for("StreamingTheaterService"),
  StreamingTheaterMapper: Symbol.for("StreamingTheaterMapper"),
};

export default TYPES;
