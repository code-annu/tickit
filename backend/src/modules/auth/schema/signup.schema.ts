import z from "zod";

export const SignupSchema = {
  body: z.object({
    firstName: z
      .string("First name is required")
      .trim()
      .nonempty("First name cannot be empty")
      .min(3, "First name must be at least 3 characters long")
      .max(100, "First name must be at most 100 characters"),
    lastName: z
      .string()
      .trim()
      .max(100, "Last name must be at most 100 characters")
      .nullish(),
    email: z
      .email("Please provide a valid email")
      .trim()
      .nonempty("Email cannot be non empty")
      .max(255, "Email must be at most 255 characters"),
    password: z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character",
      )
      .trim()
      .nonempty("Password cannot be empty"),
    city: z.string("City is required").trim().nonempty("City cannot be empty"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
      error: "Gender is required. And must be 'MALE', 'FEMALE','OTHER",
    }),
    dob: z.iso
      .date("Date of birth must be a valid date (YYYY-MM-DD)")
      .nullish(),
    avatarUrl: z.url("Avatar URL must be a valid URL").nullish(),
  }),
};
