export interface Movie {
  readonly id: string;
  readonly title: string;
  readonly overview: string;
  readonly durationMin: number;
  readonly language: string;
  readonly releaseDate: string;
  readonly posterUrl: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
