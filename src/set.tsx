/**
 * @module
 * Utility functions for working with sets.
 * Import like this: `import * as $Set from "@pschiffmann/std/set";`
 */

/**
 * Returns `true` iff `self` contains all elements in `other`.
 */
export function hasAll<T>(self: Set<T>, other: Iterable<T>): boolean {
  for (const el of other) {
    if (!self.has(el)) return false;
  }
  return true;
}

/**
 * Adds all elements in `other` to `self`.
 */
export function addAll<T>(self: Set<T>, other: Iterable<T>): void {
  for (const el of other) {
    self.add(el);
  }
}

/**
 * Deletes all elements in `other` from `self`.
 */
export function deleteAll<T>(self: Set<T>, other: Iterable<T>): void {
  for (const el of other) {
    self.delete(el);
  }
}
