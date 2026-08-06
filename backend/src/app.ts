import express from "express";
import container from "./core/di/inversify.config";
import TYPES from "./core/di/inversify.types";
import MovieRouter from "./modules/movie/movie.router";
import handleError from "./shared/middleware/error-handler.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const movieRouter = container.get<MovieRouter>(TYPES.MovieRouter);
app.use("/api/movies", movieRouter.router);

// Error handler (must be after routes)
app.use(handleError);

export default app;
