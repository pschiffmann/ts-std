/**
 * Throws an `Error` if `condition` is false. This function does **NOT** get
 * removed from production builds.
 */
export function assert(
  condition: boolean,
  message: string,
): asserts condition is true {
  if (!condition) throw new Error(message);
}
