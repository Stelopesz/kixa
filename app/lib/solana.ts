const BASE58_CHARS = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function isValidSolanaWallet(address: unknown): address is string {
  if (typeof address !== "string") return false;
  if (address.length < 32 || address.length > 44) return false;
  return BASE58_CHARS.test(address);
}
