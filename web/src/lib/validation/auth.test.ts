import * as v from "valibot";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { describe, expect, it } from "vitest";

describe("registerSchema", () => {
  it("accepts a squad name and PitchSide password", () => {
    expect(
      v.safeParse(registerSchema, {
        username: "kitvault",
        displayName: "Kit Vault",
        email: "kitvault@kitvault.test",
        password: "PitchSide!1",
      }).success,
    ).toBe(true);
  });

  it("rejects a short squad name", () => {
    expect(
      v.safeParse(registerSchema, {
        username: "kv",
        displayName: "",
        email: "kv@kitvault.test",
        password: "PitchSide!1",
      }).success,
    ).toBe(false);
  });

  it("needs a digit in the password", () => {
    expect(
      v.safeParse(registerSchema, {
        username: "new.player",
        displayName: "",
        email: "new@kitvault.test",
        password: "PitchSide!",
      }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("needs both fields", () => {
    expect(v.safeParse(loginSchema, { username: "", password: "" }).success).toBe(false);
    expect(v.safeParse(loginSchema, { username: "kitvault", password: "PitchSide!1" }).success).toBe(true);
  });
});
