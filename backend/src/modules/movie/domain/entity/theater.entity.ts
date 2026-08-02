export interface Theater {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly address: string;
  readonly avatarUrl: string;
  readonly rating: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}