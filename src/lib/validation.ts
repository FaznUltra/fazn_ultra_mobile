/** Shared form validation. Returns an error string or null when valid. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Email is required';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirm: string,
): string | null {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

export function validateRequired(
  value: string,
  field: string,
): string | null {
  if (!value.trim()) return `${field} is required`;
  return null;
}

export function validateUsername(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Username is required';
  if (!USERNAME_RE.test(v))
    return 'Username must be 3-32 letters, numbers or underscores';
  return null;
}

export function validateOtp(value: string): string | null {
  if (!/^\d{6}$/.test(value)) return 'Enter the 6-digit code';
  return null;
}
