import { Gender } from "../entity/profile.entity";

export interface ProfileCreateDto {
  userId: string;
  fullname: string;
  avatarUrl?: string | null;
  dob?: Date | null;
  gender: Gender;
}
