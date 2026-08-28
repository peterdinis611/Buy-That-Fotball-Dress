"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      await register({
        username: String(formData.get("username")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
        displayName: String(formData.get("displayName") || "") || undefined,
      });
      router.push("/sell");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The fourth official refused the card.");
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="ticket reveal delay-2 p-6 md:p-8">
      <div className="grid gap-5">
        <Field label="Name on the sheet" name="username" required placeholder="kitvault" autoComplete="username" />
        <Field label="Shirt name" name="displayName" placeholder="Kit Vault" />
        <Field label="Email" name="email" type="email" required placeholder="kitvault@kitvault.test" autoComplete="email" />
        <Field label="Password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {error ? (
        <p className="mt-4 border border-[var(--cardinal)] px-3 py-2 text-sm text-[var(--cardinal)]">{error}</p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="mt-8 h-11 w-full rounded-none border border-[var(--line)] bg-[var(--line)] font-[family-name:var(--font-teko)] text-2xl tracking-[0.14em] text-[var(--pitch)] uppercase"
      >
        {pending ? "Coming on…" : "Get a squad number"}
      </Button>
      <p className="mt-5 text-sm text-[var(--chalk)]/70">
        Already in the tunnel?{" "}
        <Link href="/login" className="text-[var(--line)]">
          Kick off
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  ...props
}: ComponentProps<typeof Input> & { label: string; name: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="font-[family-name:var(--font-teko)] text-lg tracking-[0.16em] uppercase">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        className="h-11 rounded-none border-[var(--border)] bg-transparent font-[family-name:var(--font-teko)]"
        {...props}
      />
    </div>
  );
}
