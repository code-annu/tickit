import express from "express";
import cookieParser from "cookie-parser";
import handleError from "./shared/middleware/error-handler.middleware";
import container from "./core/di/inversify.config";
import TYPES from "./core/di/inversify.types";
import AuthRouter from "./modules/auth/auth.router";
import MovieRouter from "./modules/movie/movie.router";
import TheaterRouter from "./modules/theater/theater.router";
import ShowRouter from "./modules/show/show.router";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Auth routes
const authRouter = container.get<AuthRouter>(TYPES.AuthRouter);
app.use("/api/auth", authRouter.router);

// Movie routes
const movieRouter = container.get<MovieRouter>(TYPES.MovieRouter);
app.use("/api/movies", movieRouter.router);

// Theater routes
const theaterRouter = container.get<TheaterRouter>(TYPES.TheaterRouter);
app.use("/api/theaters", theaterRouter.router);

// Show routes
const showRouter = container.get<ShowRouter>(TYPES.ShowRouter);
app.use("/api/shows", showRouter.router);

app.use(handleError);

export default app;
