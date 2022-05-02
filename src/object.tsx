/**
 * @module
 * Utility functions for working with objects.
 * Import like this: `import * as $Object from "@pschiffmann/std/object";`
 */

export function map<I, O>(
  self: Record<string, I>,
  f: (key: string, value: I) => O
): Record<string, O> {
  return Object.fromEntries(Object.entries(self).map(([k, v]) => [k, f(k, v)]));
}
