export interface GetShowsForMovieDto {
  movieId: string;
  options: { city: string; date: Date };
}
