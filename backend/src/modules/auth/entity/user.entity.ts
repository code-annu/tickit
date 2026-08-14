export interface User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly lastName: string | null;
  readonly avatarUrl: string | null;
  readonly dob: string | null;
  readonly gender: Gender;
  readonly city: string;
  readonly isEmailVerified: boolean;
  readonly isBanned: boolean;
  readonly deletedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";
