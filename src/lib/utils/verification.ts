export function generateVerificationCode(): string {
  // Generate a 6-digit numeric code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isVerificationCodeExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  
  const expirationTime = new Date(expiresAt);
  const currentTime = new Date();
  
  return currentTime > expirationTime;
}

export function getVerificationCodeExpiry(): Date {
  // Set expiry to 15 minutes from now
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15);
  return expiry;
}

export function validateVerificationCode(code: string): boolean {
  // Check if code is exactly 6 digits
  return /^\d{6}$/.test(code);
}
