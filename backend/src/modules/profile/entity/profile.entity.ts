import { User } from "@/shared/user/entity/user.entity";

export interface Profile {
  readonly id: string;
  readonly fullname: string;
  readonly dob: Date | null;
  readonly gender: Gender;
  readonly avatarUrl: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: User;
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}
