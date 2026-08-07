import { prisma } from "@/core/prisma/prisma.client";
import { Prisma } from "@/generated/prisma";
import { Profile } from "@/modules/profile/entity/profile.entity";
import ProfileMapper from "@/modules/profile/mapper/profile.mapper";

export default abstract class ProfileFactory {
  private static readonly profileMapper = new ProfileMapper();

  static async createProfile(
    userId: string,
    data: Prisma.ProfileCreateWithoutUserInput,
  ): Promise<Profile> {
    const profile = await prisma.profile.create({
      data: {
        id: userId,
        ...data,
      },
      include: { user: true },
    });

    return this.profileMapper.toProfile(profile);
  }

  static async findById(id: string): Promise<Profile | null> {
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { user: true },
    });
    return profile ? this.profileMapper.toProfile(profile) : null;
  }

  static async update(id: string, data: Prisma.ProfileUpdateInput): Promise<Profile> {
    const profile = await prisma.profile.update({
      where: { id },
      data,
      include: { user: true },
    });
    return this.profileMapper.toProfile(profile);
  }
}
