export interface TheaterShows {
  readonly theaterId: string;
  readonly onDate: string;
  readonly movies: {
    readonly movieId: string;
    readonly title: string;
    readonly posterUrl: string;
    readonly language: string;
    readonly shows: {
      id: string;
      startTime: string;
      endTime: string;
      basePrice: number;
    }[];
  }[];
}
