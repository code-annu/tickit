import "reflect-metadata";
import { Container } from "inversify";
import TYPES from "./inversify.types";
import MovieRepository from "@/modules/movie/repository/movie.repository";
import MovieService from "@/modules/movie/movie.service";
import MovieController from "@/modules/movie/movie.controller";
import MovieRouter from "@/modules/movie/movie.router";

const container = new Container();

// Movie bindings
container.bind<MovieRepository>(TYPES.MovieRepository).to(MovieRepository);
container.bind<MovieService>(TYPES.MovieService).to(MovieService);
container.bind<MovieController>(TYPES.MovieController).to(MovieController);
container.bind<MovieRouter>(TYPES.MovieRouter).to(MovieRouter);

export default container;
