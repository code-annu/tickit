export interface TheaterShow {
  readonly id: string;
  readonly movie: {
    readonly id: string;
    readonly title: string;
    readonly posterUrl: string;
    readonly language: string;
  };
  readonly onDate: Date;
  readonly startTime: Date;
  readonly onwardsAmount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
