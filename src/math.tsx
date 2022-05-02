export function clamp(self: number, min: number, max: number) {
  return Math.min(Math.max(self, min), max);
}

export function sum(values: number[]): number {
  let result = 0;
  for (const n of values) result += n;
  return result;
}
