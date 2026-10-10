import { db } from "../prisma/db.js";

export type Profile = Awaited<ReturnType<typeof db.orm.public.Profile.create>>;

export type ProfileCreateInput = Parameters<typeof db.orm.public.Profile.create>[0];

export type ProfileUpdateInput = Parameters<typeof db.orm.public.Profile.update>[0];
