import z from "zod";

export const loginSchema = z.object({
  email: z
    .email({ pattern: z.regexes.email, error: "Valid email is required" })
    .trim()
    .nonempty("Email cannot be empty"),
  password: z
    .string("Password is required")
    .trim()
    .nonempty("Password cannot be empty"),
});
