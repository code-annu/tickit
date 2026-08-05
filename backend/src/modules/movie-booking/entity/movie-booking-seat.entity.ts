export interface MovieBookingSeat {
  readonly id: string;
  readonly inventory: {
    id: string;
    price: number;
    seat: {
      id: string;
      seatNumber: string;
    };
  };
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
