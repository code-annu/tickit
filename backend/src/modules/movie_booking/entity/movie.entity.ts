export interface Movie {
  readonly id: string;
  readonly title: string;
  readonly posterUrl: string;
  readonly releasedDate: Date;
  readonly overview: string;
  readonly language: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}
