/**
 * @module
 * Utility functions for working with sets.
 * Import like this: `import * as $Set from "@pschiffmann/std/set";`
 */

/**
 * Returns `true` iff `a` and `b` contain the same elements.
 */
export function equals<T>(a: Set<T>, b: Set<T>) {
  if (a.size !== b.size) return false;
  for (const el of a) {
    if (!b.has(el)) return false;
  }
  return true;
}

/**
 * Yields the set difference `a \ b`, i.e. the elements in `a` that are not in
 * `b`.
 */
export function* diff<T>(a: Set<T>, b: Set<T>): Iterable<T> {
  for (const el of a) {
    if (!b.has(el)) yield el;
  }
}

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
