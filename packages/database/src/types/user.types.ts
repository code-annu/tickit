import { db } from "../prisma/db.js";

export type User = Awaited<ReturnType<typeof db.orm.public.User.create>>;

export type UserCreateInput = Parameters<typeof db.orm.public.User.create>[0];

export type UserUpdateInput = Parameters<typeof db.orm.public.User.update>[0];
