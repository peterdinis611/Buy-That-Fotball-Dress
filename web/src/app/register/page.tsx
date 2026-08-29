import { RegisterForm } from "@/components/auth";

export default function RegisterPage() {
  return (
    <div className="mx-auto grid max-w-[1400px] items-start gap-12 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-16">
      <div>
        <p className="reveal font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
          New account
        </p>
        <h1 className="reveal delay-1 mt-2 text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl">
          Create an account.
        </h1>
        <p className="reveal delay-2 mt-4 max-w-sm text-lg text-[var(--ink)]/75">
          Then you can bid on live lots or list a shirt of your own.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
