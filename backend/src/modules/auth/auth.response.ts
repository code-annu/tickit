import { injectable } from "inversify";
import { UserSession } from "./entity/session.entity";

@injectable()
export default class AuthResponse {
  buildAuthResponse(session: UserSession) {
    const { user, accessToken, id } = session;
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          avatarUrl: user.avatarUrl,
          isEmailVerified: user.isEmailVerified,
        },
        session: { id, accessToken },
      },
    };
  }
}
