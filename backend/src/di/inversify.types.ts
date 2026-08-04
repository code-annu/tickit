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

  // Movie types
  MovieRepository: Symbol.for("MovieRepository"),
  TheaterRepository: Symbol.for("TheaterRepository"),
  StreamingTheaterRepository: Symbol.for("StreamingTheaterRepository"),
  TheaterSeatInventoryRepository: Symbol.for("TheaterSeatInventoryRepository"),
  StreamingTheaterMapper: Symbol.for("StreamingTheaterMapper"),
  TheaterSeatInventoryMapper: Symbol.for("TheaterSeatInventoryMapper"),
  MovieListingService: Symbol.for("MovieListingService"),
  MovieBookingService: Symbol.for("MovieBookingService"),
  MovieBookingController: Symbol.for("MovieBookingController"),
  MovieListingController: Symbol.for("MovieListingController"),
  MovieBookingRouter: Symbol.for("MovieBookingRouter"),
  MovieListingRouter: Symbol.for("MovieListingRouter"),
  MovieRouter: Symbol.for("MovieRouter"),
};

export default TYPES;
