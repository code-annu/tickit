import z from "zod";

export const LoginSchema = {
  body: z.object({
    email: z
      .email("Please provide a valid email")
      .trim()
      .nonempty("Email cannot be empty"),
    password: z
      .string("Password is required")
      .trim()
      .nonempty("Password cannot be empty"),
  }),
};
