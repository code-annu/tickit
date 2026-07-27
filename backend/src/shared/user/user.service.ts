import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import UserRepository from "./repository/user.repository";
import { User } from "./entity/user.entity";
import bcrypt from "bcrypt";
import ConflictError from "../error/types/ConflictError";
import UserErrorCode from "./UserErrorCode";

@injectable()
export default class UserService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepo: UserRepository,
  ) {}

  async createUser(email: string, password: string): Promise<User> {
    const existingUserByEmail = await this.userRepo.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictError(
        "Email already exists",
        UserErrorCode.EMAIL_ALREADY_EXISTS,
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return await this.userRepo.create({ email, passwordHash });
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async getById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async deleteUser(id: string): Promise<User> {
    return this.userRepo.softDelete(id);
  }
}
