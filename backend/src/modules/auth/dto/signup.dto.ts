import { Gender } from "@/generated/prisma/enums";
import { ClientInfoType } from "@/shared/util/client-info.util";

export interface SignupDto {
  firstName: string;
  lastName?: string | null;
  email: string;
  password: string;
  city: string;
  gender: Gender;
  dob?: string | null;
  avatarUrl?: string | null;
  client: ClientInfoType;
}
