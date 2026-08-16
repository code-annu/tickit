const TYPES = {
  // Util types
  JWTUtil: Symbol.for("JWTUtil"),
  ClientInfoUtil: Symbol.for("ClientInfoUtil"),

  // User types

  // Auth types
  AuthMapper: Symbol.for("AuthMapper"),
  AuthService: Symbol.for("AuthService"),
  AuthController: Symbol.for("AuthController"),
  AuthResponse: Symbol.for("AuthResponse"),
  AuthRouter: Symbol.for("AuthRouter"),
  SessionRepository: Symbol.for("SessionRepository"),
  UserRepository: Symbol.for("UserRepository"),

  // Profile types
  ProfileRepository: Symbol.for("ProfileRepository"),
  ProfileService: Symbol.for("ProfileService"),
  ProfileMapper: Symbol.for("ProfileMapper"),
  ProfileRouter: Symbol.for("ProfileRouter"),

  // Movie types
  MovieMapper: Symbol.for("MovieMapper"),
  MovieShowMapper: Symbol.for("MovieShowMapper"),
  MovieRepository: Symbol.for("MovieRepository"),
  MovieShowRepository: Symbol.for("MovieShowRepository"),
  MovieService: Symbol.for("MovieService"),
  MovieResponse: Symbol.for("MovieResponse"),
  MovieController: Symbol.for("MovieController"),
  MovieRouter: Symbol.for("MovieRouter"),

  // Theater types
  TheaterMapper: Symbol.for("TheaterMapper"),
  TheaterShowMapper: Symbol.for("TheaterShowMapper"),
  TheaterRepository: Symbol.for("TheaterRepository"),
  TheaterShowRepository: Symbol.for("TheaterShowRepository"),
  TheaterService: Symbol.for("TheaterService"),
  TheaterResponse: Symbol.for("TheaterResponse"),
  TheaterController: Symbol.for("TheaterController"),
  TheaterRouter: Symbol.for("TheaterRouter"),

  // Show types
  ShowMapper: Symbol.for("ShowMapper"),
  SeatHoldRepository: Symbol.for("SeatHoldRepository"),
  ShowRepository: Symbol.for("ShowRepository"),
  ShowService: Symbol.for("ShowService"),
  ShowResponse: Symbol.for("ShowResponse"),
  ShowController: Symbol.for("ShowController"),
  ShowRouter: Symbol.for("ShowRouter"),
};

export default TYPES;
