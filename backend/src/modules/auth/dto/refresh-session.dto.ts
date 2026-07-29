import { ClientInfoType } from "@/shared/util/client-info.util";

export interface RefreshSessionDto {
  token?: string | null;
  client: ClientInfoType;
}
