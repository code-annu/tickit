import { injectable } from "inversify";
import {
  Profile as PrismaProfile,
  User as PrismaUser,
} from "@/generated/prisma";
import { Gender, Profile } from "../entity/profile.entity";

type ProfileWithUser = PrismaProfile & { user: PrismaUser };

@injectable()
export default class ProfileMapper {
  toProfile(profileWithUser: ProfileWithUser): Profile {
    return {
      ...profileWithUser,
      gender: profileWithUser.gender as Gender,
    };
  }
}
