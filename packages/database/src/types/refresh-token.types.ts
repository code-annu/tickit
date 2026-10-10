import { db } from "../prisma/db.js";

export type RefreshToken = Awaited<
  ReturnType<typeof db.orm.public.RefreshToken.create>
>;

export type RefreshTokenCreateInput = Parameters<
  typeof db.orm.public.RefreshToken.create
>[0];

export type RefreshTokenUpdateInput = Parameters<
  typeof db.orm.public.RefreshToken.update
>[0];
