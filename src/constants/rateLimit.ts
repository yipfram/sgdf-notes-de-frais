export const RATE_LIMIT_COURT = {
  limite: 3,
  fenetreMs: 30 * 1000,
} as const;

export const RATE_LIMIT_LONG = {
  limite: 18,
  fenetreMs: 10 * 60 * 1000,
} as const;
