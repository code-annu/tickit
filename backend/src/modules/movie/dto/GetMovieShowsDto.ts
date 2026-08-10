export interface GetMovieShowsDto {
  movieId: string;
  options: { city: string; date: Date };
}
