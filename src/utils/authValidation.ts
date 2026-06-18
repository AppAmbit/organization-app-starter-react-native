const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NAME_MIN = 2;
export const NAME_MAX = 50;
export const EMAIL_MIN = 5;
export const EMAIL_MAX = 100;
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 20;

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Name is required';
  }
  if (trimmed.length < NAME_MIN) {
    return `Name must be at least ${NAME_MIN} characters`;
  }
  if (trimmed.length > NAME_MAX) {
    return `Name must be at most ${NAME_MAX} characters`;
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email is required';
  }
  if (trimmed.length < EMAIL_MIN) {
    return `Email must be at least ${EMAIL_MIN} characters`;
  }
  if (trimmed.length > EMAIL_MAX) {
    return `Email must be at most ${EMAIL_MAX} characters`;
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Enter a valid email address';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Password must be at most ${PASSWORD_MAX} characters`;
  }
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
}
