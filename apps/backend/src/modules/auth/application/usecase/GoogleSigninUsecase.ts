import { dbTransaction } from "@tickit/database/client";
import { OAuth2Client } from "google-auth-library";
import { injectable } from "inversify";

const googleClientId = "fakeId";


@injectable()
export default class GoogleSigninUsecase {
  /**
   * build oauth client and use it to verify credential
   */
}
