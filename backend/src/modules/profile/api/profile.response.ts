import { Profile } from "../entity/profile.entity";

export function buildProfileResponse(profile: Profile, message: string) {
  const { user, id, fullname, avatarUrl, dob, gender } = profile;
  const { email, isEmailVerified, isBanned, createdAt: joinedAt } = user;
  return {
    success: true,
    message,
    data: {
      id,
      fullname,
      avatarUrl,
      dob,
      gender,
      user: { email, isEmailVerified, isBanned, joinedAt },
    },
  };
}
