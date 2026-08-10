import express from "express";
import cookieParser from "cookie-parser";
import container from "./core/di/inversify.config";
import TYPES from "./core/di/inversify.types";
import AuthRouter from "./modules/auth/auth.router";
import ProfileRouter from "./modules/profile/profile.router";
import MovieRouter from "./modules/movie/movie.router";
import TheaterRouter from "./modules/theater/theater.router";
import ShowRouter from "./modules/show/show.router";
import handleError from "./shared/middleware/error-handler.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const authRouter = container.get<AuthRouter>(TYPES.AuthRouter);
app.use("/api/auth", authRouter.getRouter());

const profileRouter = container.get<ProfileRouter>(TYPES.ProfileRouter);
app.use("/api/profile", profileRouter.getRouter());

const movieRouter = container.get<MovieRouter>(TYPES.MovieRouter);
app.use("/api/movies", movieRouter.router);

const theaterRouter = container.get<TheaterRouter>(TYPES.TheaterRouter);
app.use("/api/theaters", theaterRouter.router);

const showRouter = container.get<ShowRouter>(TYPES.ShowRouter);
app.use("/api/shows", showRouter.router);

// Error handler (must be after routes)
app.use(handleError);

export default app;
