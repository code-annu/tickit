import { db } from "../prisma/db.js";

export type Session = Awaited<ReturnType<typeof db.orm.public.Session.create>>;

export type SessionCreateInput = Parameters<typeof db.orm.public.Session.create>[0];

export type SessionUpdateInput = Parameters<typeof db.orm.public.Session.update>[0];
