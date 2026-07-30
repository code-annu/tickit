import { Gender } from "../entity/profile.entity";

export interface ProfileUpdateDto {
  id: string;
  fullname?: string;
  avatarUrl?: string | null;
  dob?: Date | null;
  gender?: Gender;
}
