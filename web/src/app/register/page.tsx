import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto grid max-w-[1400px] items-start gap-12 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-16">
      <div>
        <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.28em] text-[var(--line)]">
          Fourth official
        </p>
        <h1 className="reveal delay-1 mt-2 text-6xl leading-[0.82] text-[var(--chalk)] md:text-8xl">
          Get a squad number.
        </h1>
        <p className="reveal delay-2 mt-4 max-w-sm text-lg text-[var(--chalk)]/75">
          Then you can sub a shirt onto the pitch.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
