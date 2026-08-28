import * as v from "valibot";

export const loginSchema = v.object({
  username: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Name on the sheet is required."),
    v.maxLength(256, "That squad name is too long."),
  ),
  password: v.pipe(v.string(), v.nonEmpty("Password is required.")),
});

export const registerSchema = v.object({
  username: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Name on the sheet is required."),
    v.minLength(3, "Squad names are at least 3 characters."),
    v.maxLength(32, "Squad names are 32 characters max."),
    v.regex(
      /^[a-zA-Z0-9._-]+$/,
      "Only letters, numbers, dots, underscores and hyphens.",
    ),
  ),
  displayName: v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(64, "Shirt name is too long."),
  ),
  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Email is required."),
    v.email("That email is offside."),
    v.maxLength(256, "That email is too long."),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Password is required."),
    v.minLength(8, "Password needs 8+ characters."),
    v.check((value) => /[A-Za-z]/.test(value), "Password needs a letter."),
    v.check((value) => /[0-9]/.test(value), "Password needs a digit."),
  ),
});

export type LoginInput = v.InferOutput<typeof loginSchema>;
export type RegisterInput = v.InferOutput<typeof registerSchema>;
