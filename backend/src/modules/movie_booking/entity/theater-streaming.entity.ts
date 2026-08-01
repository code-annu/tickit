import { Theater } from "./theater.entity";

export interface TheaterStreaming {
  readonly id: string;
  readonly theater: Theater;
  readonly onDate: Date;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly duration: number;
  readonly onwardsAmount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
