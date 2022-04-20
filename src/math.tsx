export function clamp(self: number, min: number, max: number) {
  return Math.min(Math.max(self, min), max);
}
