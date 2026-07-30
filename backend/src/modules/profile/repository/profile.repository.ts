import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";
import { injectable, inject } from "inversify";
import { Profile } from "../entity/profile.entity";
import TYPES from "@/di/inversify.types";
import ProfileMapper from "../mapper/profile.mapper";

@injectable()
export default class ProfileRepository {
  constructor(
    @inject(TYPES.ProfileMapper) private readonly profileMapper: ProfileMapper,
    private readonly db = prisma,
  ) {}

  async create(
    userId: string,
    data: Prisma.ProfileCreateWithoutUserInput,
  ): Promise<Profile> {
    const result = await this.db.profile.create({
      data: { ...data, user: { connect: { id: userId } } },
      include: { user: true },
    });
    return this.profileMapper.toProfile(result);
  }

  async findById(id: string): Promise<Profile | null> {
    const result = await this.db.profile.findUnique({
      where: { id },
      include: { user: true },
    });
    return result ? this.profileMapper.toProfile(result) : null;
  }

  async update(id: string, data: Prisma.ProfileUpdateInput): Promise<Profile> {
    const result = await this.db.profile.update({
      where: { id },
      data,
      include: { user: true },
    });
    return this.profileMapper.toProfile(result);
  }

  async delete(id: string): Promise<void> {
    await this.db.profile.delete({
      where: { id },
    });
  }
}
