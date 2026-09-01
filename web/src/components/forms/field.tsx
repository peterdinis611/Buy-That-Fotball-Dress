import { type ComponentProps } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect as UiNativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

export type BoundStringField = {
  name: string;
  state: {
    value: string;
    meta: { errors: unknown[] };
  };
  handleBlur: () => void;
  handleChange: (value: string) => void;
};

export function bindStringField(field: {
  name: string;
  state: { value: unknown; meta: { errors: unknown[] } };
  handleBlur: () => void;
  handleChange: (value: never) => void;
}): BoundStringField {
  return {
    name: field.name,
    state: {
      value: String(field.state.value ?? ""),
      meta: field.state.meta,
    },
    handleBlur: field.handleBlur,
    handleChange: (value) => field.handleChange(value as never),
  };
}

export function fieldMessage(errors: unknown[]) {
  const first = errors[0];
  if (first == null) return undefined;
  if (typeof first === "string") return first;
  if (typeof first === "object" && "message" in first) {
    const message = (first as { message: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}

export function Field({
  label,
  name,
  error,
  className,
  ...props
}: ComponentProps<typeof Input> & { label: string; name: string; error?: string }) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name} className="font-[family-name:var(--font-display)] text-lg tracking-[0.16em] uppercase">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-11 rounded-none border-[var(--border)] bg-[#0c0c0c] font-[family-name:var(--font-display)] text-xl text-[#f3f1ec] caret-[var(--bib)] placeholder:text-[#f3f1ec]/40 [-webkit-text-fill-color:#f3f1ec]",
          error && "border-[var(--cardinal)]",
        )}
        {...props}
      />
      {error ? <p className="text-sm text-[var(--cardinal)]">{error}</p> : null}
    </div>
  );
}

export function TextField({
  field,
  label,
  className,
  ...props
}: {
  field: BoundStringField;
  label: string;
} & Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "onBlur">) {
  return (
    <Field
      label={label}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(event) => field.handleChange(event.target.value)}
      error={fieldMessage(field.state.meta.errors)}
      className={className}
      {...props}
    />
  );
}

export function NativeSelect({
  label,
  name,
  options,
  error,
  value,
  onBlur,
  onChange,
}: {
  label: string;
  name: string;
  options: string[];
  error?: string;
  value?: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="font-[family-name:var(--font-display)] text-lg tracking-[0.16em] uppercase">
        {label}
      </Label>
      <UiNativeSelect
        id={name}
        name={name}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange?.(event.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full [&_[data-slot=native-select]]:h-11 [&_[data-slot=native-select]]:border-[var(--border)] [&_[data-slot=native-select]]:bg-[#0c0c0c] [&_[data-slot=native-select]]:text-xl [&_[data-slot=native-select]]:text-[#f3f1ec] [&_[data-slot=native-select]]:[-webkit-text-fill-color:#f3f1ec]",
          error && "[&_[data-slot=native-select]]:border-[var(--cardinal)]",
        )}
      >
        {options.map((option) => (
          <NativeSelectOption key={option} value={option} className="bg-[var(--pitch)]">
            {option}
          </NativeSelectOption>
        ))}
      </UiNativeSelect>
      {error ? <p className="text-sm text-[var(--cardinal)]">{error}</p> : null}
    </div>
  );
}

export function SelectField({
  field,
  label,
  options,
}: {
  field: BoundStringField;
  label: string;
  options: string[];
}) {
  return (
    <NativeSelect
      label={label}
      name={field.name}
      options={options}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={field.handleChange}
      error={fieldMessage(field.state.meta.errors)}
    />
  );
}

export function FormBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="mt-4 border-[var(--cardinal)] bg-transparent px-3 py-2">
      <AlertDescription className="text-sm text-[var(--cardinal)]">{message}</AlertDescription>
    </Alert>
  );
}
