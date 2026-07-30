import { Gender } from "../entity/profile.entity";
import z from "zod";

export const profileUpdateSchema = z.object({
  fullname: z
    .string("Fullname must be a string")
    .trim()
    .nonempty("Fullname cannot be empty")
    .min(3, "Fullname must be at least 3 characters")
    .max(50, "Fullname must be at most 50 characters")
    .optional(),

  avatarUrl: z.url("Avatar URL must be a valid URL").trim().nullish(),

  dob: z.coerce
    .date({ error: "Date of birth must be a valid date" })
    .nullish(),

  gender: z.enum(Gender, {
    error: "Gender must be one of: MALE, FEMALE, OTHER",
  }),
});
