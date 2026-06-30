export type Role = "citizen" | "mla";

declare global {
  interface CustomJwtSessionClaims {
    metadata?: { role?: Role };
  }
}

export {};
