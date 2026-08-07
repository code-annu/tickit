import { ClientInfoType } from "@/shared/util/client-info.util";

export interface SignupDto {
  email: string;
  password: string;
  client: ClientInfoType
}


