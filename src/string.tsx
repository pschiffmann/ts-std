/**
 * Caution: Doesn't handle surrogate pairs correctly!
 */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.substring(1);
}
