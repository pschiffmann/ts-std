export function clamp(self: number, min: number, max: number) {
  return Math.min(Math.max(self, min), max);
}

export function sum(values: number[]): number {
  let result = 0;
  for (const n of values) result += n;
  return result;
}

/**
 * Returns a random integer from range [min, max).
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
 */
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
