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
};

export default TYPES;
