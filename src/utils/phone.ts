export function isPlaceholderPhone(phone: string) {
  return phone.startsWith('VERIFY_');
}

/**
 * Returns a dialable number. When the centre's own number is still an
 * unverified placeholder, falls back to the provided number (the Vimukthi
 * central line, read from data.json) so the call still connects somewhere useful.
 */
export function resolveDialNumber(phone: string, fallback: string) {
  return isPlaceholderPhone(phone) ? fallback : phone;
}
