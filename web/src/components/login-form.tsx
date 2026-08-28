"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ComponentProps } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      await login(String(formData.get("username")), String(formData.get("password")));
      router.push(searchParams.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Offside — that kick-off failed.");
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="ticket reveal delay-2 p-6 md:p-8">
      <div className="grid gap-5">
        <Field label="Name on the sheet" name="username" required placeholder="kitvault" autoComplete="username" />
        <Field label="Password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {error ? (
        <p className="mt-4 border border-[var(--cardinal)] px-3 py-2 text-sm text-[var(--cardinal)]">{error}</p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="mt-8 h-11 w-full rounded-none border border-[var(--line)] bg-[var(--line)] font-[family-name:var(--font-teko)] text-2xl tracking-[0.14em] text-[var(--pitch)] uppercase"
      >
        {pending ? "Walking out…" : "Kick off"}
      </Button>
      <p className="mt-5 text-sm text-[var(--chalk)]/70">
        No squad number yet?{" "}
        <Link href="/register" className="text-[var(--line)]">
          Sub on
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
