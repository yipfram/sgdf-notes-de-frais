import crypto from "node:crypto";

export interface ValidationTresorerie {
  status: "pending" | "verified";
  tokenHash?: string;
  expiresAt?: number;
  verifiedAt?: number;
}

export function creerValidationTresorerie() {
  const token = crypto.randomBytes(32).toString("base64url");
  return {
    token,
    verification: {
      status: "pending" as const,
      tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      expiresAt: Date.now() + 48 * 60 * 60 * 1000,
    },
  };
}

export function jetonTresorerieValide(
  validation: ValidationTresorerie,
  jeton: string,
) {
  if (
    validation.status !== "pending" ||
    !validation.tokenHash ||
    !validation.expiresAt ||
    validation.expiresAt < Date.now()
  )
    return false;
  const actual = crypto.createHash("sha256").update(jeton).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(actual),
    Buffer.from(validation.tokenHash),
  );
}
