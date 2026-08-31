export const STEWARD_ROLE = "Steward";

export function isSteward(user: { roles?: string[] } | null | undefined) {
  return Boolean(user?.roles?.includes(STEWARD_ROLE));
}
