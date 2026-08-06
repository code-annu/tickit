export interface Movie {
  readonly id: string;
  readonly title: string;
  readonly posterUrl: string;
  readonly language: string;
  readonly overview: string;
  readonly releasedDate: Date;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}
