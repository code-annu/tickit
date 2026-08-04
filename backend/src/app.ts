import cookieParser from "cookie-parser";
import express from "express";
import handleError from "./shared/middleware/error-handler.middleware";
import container from "./di/inversify.config";
import TYPES from "./di/inversify.types";
import AuthRouter from "./modules/auth/api/auth.router";
import ProfileRouter from "./modules/profile/api/profile.router";
import MovieRouter from "./modules/movie/api/router/movie.router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRouter = container.get<AuthRouter>(TYPES.AuthRouter);
const profileRouter = container.get<ProfileRouter>(TYPES.ProfileRouter);
const movieRouter = container.get<MovieRouter>(TYPES.MovieRouter);

app.use("/api/auth", authRouter.getRouter());
app.use("/api/profile", profileRouter.getRouter());
app.use("/api/movie", movieRouter.getRouter());
app.use(handleError);

export default app;
