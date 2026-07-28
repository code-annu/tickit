import { ClientInfoType } from "@/shared/util/client-info.util";

export interface RefreshTokenDto {
  token: string;
  client: ClientInfoType;
}
