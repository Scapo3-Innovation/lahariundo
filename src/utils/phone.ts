export const VIMUKTHI_HELPLINE = '14405';

export function isPlaceholderPhone(phone: string) {
  return phone.startsWith('VERIFY_');
}

/** Returns a dialable number — uses Vimukthi helpline when centre number is unverified. */
export function resolveDialNumber(phone: string) {
  return isPlaceholderPhone(phone) ? VIMUKTHI_HELPLINE : phone;
}
