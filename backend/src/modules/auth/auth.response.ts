import { Session } from "./entity/session.entity";

export function buildAuthResponse(session: Session, message: string) {
  const { user, id: sessionId, accessToken } = session;

  const { id: userId, email, isEmailVerified, isBanned } = user;

  return {
    success: true,
    message,
    data: {
      session: {
        id: sessionId,
        accessToken,
      },
      user: {
        id: userId,
        email,
        isEmailVerified,
        isBanned,
        joinedAt: user.createdAt,
      },
    },
  };
}
