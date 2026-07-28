import { Request } from "express";
import { injectable } from "inversify";
import { UAParser } from "ua-parser-js";

export interface ClientInfoType {
  deviceName: string | null;
  deviceType: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

@injectable()
export default class ClientInfoUtil {
  getClientInfo(req: Request): ClientInfoType {
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
      ipAddress: req.ip ?? null,
      userAgent: result.ua ?? null,
      deviceType: result.device.type ?? null,
      deviceName: result.device.vendor ?? null,
    };
  }
}
