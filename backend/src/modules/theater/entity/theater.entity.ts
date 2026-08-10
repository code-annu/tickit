export interface Theater {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly avatarUrl: string;
  readonly address: string;
  readonly rating: number;
  readonly seatingCapacity: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
