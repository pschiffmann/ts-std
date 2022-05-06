/**
 * @module
 * Utility functions for working with arrays.
 * Import like this: `import * as $Array from "@pschiffmann/std/array";`
 */

/**
 * Returns `true` iff `a` and `b` contain the same elements in the same order.
 * Elements are compared with `compare`, which defaults to `Object.is`.
 */
export function equals<T>(
  a: T[],
  b: T[],
  compare: (a: T, b: T) => boolean = Object.is
): boolean {
  const l = a.length;
  if (b.length !== l) return false;
  for (let i = 0; i < l; i++) {
    if (!compare(a[i], b[i])) return false;
  }
  return true;
}

export function isValidIndexFor(
  self: unknown[],
  index: unknown
): index is number {
  return (
    typeof index === "number" &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < self.length
  );
}

export function last<T>(self: T[]): T | undefined {
  return self[self.length - 1];
}
