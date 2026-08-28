import type { BaseIssue, BaseSchema } from "valibot";
import * as v from "valibot";

export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

export function fieldErrors(issues: [BaseIssue<unknown>, ...BaseIssue<unknown>[]]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path?.map((item) => String(item.key)).join(".") || "_form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function parseForm<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  schema: TSchema,
  formData: FormData,
):
  | { ok: true; data: v.InferOutput<TSchema> }
  | { ok: false; errors: Record<string, string> } {
  const result = v.safeParse(schema, formValues(formData));
  if (result.success) return { ok: true, data: result.output };
  return { ok: false, errors: fieldErrors(result.issues) };
}
