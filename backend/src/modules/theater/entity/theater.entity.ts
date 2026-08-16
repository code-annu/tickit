export interface Theater {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly address: string;
  readonly rating: number;
  readonly avatarUrl: string;
  readonly seatingCapacity: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
