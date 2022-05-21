/**
 * Returns the first element of `self` in iteration order, or `undefined` if
 * `self` is empty.
 */
export function first<T>(self: Iterable<T>): T | undefined {
  const it = self[Symbol.iterator]();
  const { done, value } = it.next();
  return done ? undefined : value;
}
