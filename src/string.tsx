/**
 * Caution: Doesn't handle surrogate pairs correctly!
 */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.substring(1);
}

/**
 * Trims all occurences of `pattern` at the start of `self`.
 *
 * ```ts
 * $String.trimStart("abab Hello", "ab") === " Hello"
 * ```
 */
export function trimStart(self: string, pattern: string) {
  let i = 0;
  while (self.startsWith(pattern, i)) i += pattern.length;
  return self.substring(i);
}

/**
 * Trims all occurences of `pattern` at the end of `self`.
 *
 * ```ts
 * $String.trimEnd("Hello abab", "ab") === "Hello "
 * ```
 */
export function trimEnd(self: string, pattern: string) {
  let i = self.length;
  while (self.endsWith(pattern, i)) i -= pattern.length;
  return self.substring(0, i);
}
