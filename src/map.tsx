/**
 * @module
 * Utility functions for working with sets.
 * Import like this: `import * as $Set from "@pschiffmann/std/set";`
 */

/**
 * Returns `true` iff `a` and `b` contain the same elements.
 */
export function equals<K, V>(a: Map<K, V>, b: Map<K, V>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) {
    if (!b.has(k) || !Object.is(b.get(k), v)) return false;
  }
  return true;
}

/**
 * Returns `self.get(key)` if it exists, else adds the result of `ifAbsent` to
 * `self` and returns it.
 */
export function putIfAbsent<K, V>(
  self: Map<K, V>,
  key: K,
  ifAbsent: () => V
): V {
  if (self.has(key)) return self.get(key)!;
  const result = ifAbsent();
  self.set(key, result);
  return result;
}

/**
 * Copies all entries from `other` to `self`. Overwrites existing keys in
 * `self`.
 */
export function setAll<K, V>(self: Map<K, V>, other: Iterable<[K, V]>): void {
  for (const [k, v] of other) {
    self.set(k, v);
  }
}
