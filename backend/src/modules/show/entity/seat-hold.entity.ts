export interface SeatHold {
  readonly id: string;
  readonly showId: string;
  readonly status: SeatHoldStatus;
  readonly expiresAt: Date;
}

export type SeatHoldStatus = "ACTIVE" | "EXPIRED" | "RELEASED" | "CONVERTED";
