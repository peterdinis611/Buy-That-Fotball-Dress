"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { FormBanner, TextField, bindStringField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "@/lib/query/hooks";
import { registerSchema } from "@/lib/validation";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegisterMutation();
  const [banner, setBanner] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: registerSchema,
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      setBanner(null);
      try {
        await register.mutateAsync({
          ...value,
          displayName: value.displayName || undefined,
        });
        router.push("/sell");
        router.refresh();
      } catch (err) {
        setBanner(err instanceof Error ? err.message : "The fourth official refused the card.");
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
            <TextField field={bindStringField(field)} label="Name on the sheet" placeholder="kitvault" autoComplete="username" />
          )}
        </form.Field>
        <form.Field name="displayName">
          {(field) => <TextField field={bindStringField(field)} label="Shirt name" placeholder="Kit Vault" />}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <TextField
              field={bindStringField(field)}
              label="Email"
              type="email"
              placeholder="kitvault@kitvault.test"
              autoComplete="email"
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <TextField field={bindStringField(field)} label="Password" type="password" autoComplete="new-password" />
          )}
        </form.Field>
      </div>
      <FormBanner message={banner} />
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || register.isPending}
            className="mt-8 h-11 w-full rounded-none border border-[var(--line)] bg-[var(--line)] font-[family-name:var(--font-teko)] text-2xl tracking-[0.14em] text-[var(--pitch)] uppercase"
          >
            {isSubmitting || register.isPending ? "Coming on…" : "Get a squad number"}
          </Button>
        )}
      </form.Subscribe>
      <p className="mt-5 text-sm text-[var(--chalk)]/70">
        Already in the tunnel?{" "}
        <Link href="/login" className="text-[var(--line)]">
          Kick off
        </Link>
      </p>
    </form>
  );
}
