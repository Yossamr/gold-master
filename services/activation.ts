import * as OTPAuth from "otpauth";

/**
 * SECURITY TODO: 
 * The current activation logic relies on a hardcoded TOTP secret inside the client application.
 * This is fundamentally insecure as anyone can extract the secret and generate valid tokens.
 * Furthermore, the "Local Mode" bypasses activation entirely.
 * 
 * REQUIRED FUTURE ARCHITECTURE:
 * 1. Build a small backend (e.g., Cloudflare Worker, Vercel function, or simple Node.js server).
 * 2. The client sends the activation code to the backend.
 * 3. The backend validates the code and returns a signed JWT or session token.
 * 4. The client uses this token for subsequent operations.
 * 
 * Until this backend is built, we consolidate the check here and enforce a time-limited trial for local mode.
 */

const TOTP_SECRET = "K5XW6Z3DPE5K3LMP";
const ISSUER = "GoldMaster";
const LABEL = "SystemActivation";

export function validateActivationCode(code: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: LABEL,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(TOTP_SECRET),
  });

  const delta = totp.validate({ token: code.trim(), window: 1 });
  return delta !== null;
}

export function generateCurrentActivationCode(): string {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: LABEL,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(TOTP_SECRET),
  });
  return totp.generate();
}

