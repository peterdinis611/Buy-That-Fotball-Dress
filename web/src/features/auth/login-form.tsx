"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { FormBanner, TextField, bindStringField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/hooks";
import { loginSchema } from "@/lib/validation";

function nextPath(raw: string | null) {
  if (!raw) return "/";
  if (raw.startsWith("/")) return raw;
  try {
    const url = new URL(raw);
    if (url.origin === window.location.origin) return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
  return "/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLoginMutation();
  const [banner, setBanner] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setBanner(null);
      try {
        await login.mutateAsync(value);
        router.push(nextPath(searchParams.get("next") || searchParams.get("callbackUrl")));
        router.refresh();
      } catch (err) {
        setBanner(err instanceof Error ? err.message : "Sign in failed. Check the name and password.");
      }
    },
  });

  return (
    <form
      noValidate
      className="ticket reveal delay-2 p-6 md:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="grid gap-5">
        <form.Field name="username">
          {(field) => (
            <TextField field={bindStringField(field)} label="Username" placeholder="kitvault" autoComplete="username" />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <TextField field={bindStringField(field)} label="Password" type="password" autoComplete="current-password" />
          )}
        </form.Field>
      </div>
      <FormBanner message={banner} />
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || login.isPending}
            className="mt-8 h-11 w-full rounded-none border-0 bg-[var(--bib)] font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-[var(--stud)] uppercase"
          >
            {isSubmitting || login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        )}
      </form.Subscribe>
      <p className="mt-5 text-sm text-[var(--chalk)]/70">
        Need an account?{" "}
        <Link href="/register" className="text-[var(--bib)]">
          Create one
        </Link>
      </p>
    </form>
  );
}
