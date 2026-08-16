export interface MovieShows {
  readonly movieId: string;
  readonly onDate: string;
  readonly theaters: {
    readonly id: string;
    readonly name: string;
    readonly city: string;
    readonly avatarUrl: string;
    readonly address: string;
    readonly rating: number;
    readonly shows: {
      readonly id: string;
      readonly startTime: string;
      readonly endTime: string;
      readonly basePrice: number;
    }[];
  }[];
}

