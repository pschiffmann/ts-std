export interface Position {
  readonly rootWidth: number;
  readonly rootHeight: number;
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Returns the distance between the root top and element bottom edge.
 */
export function offsetBottom(p: Position): number {
  return p.top + p.height;
}

/**
 * Returns the distance between the root left and element right edge.
 */
export function offsetRight(p: Position): number {
  return p.left + p.width;
}

/**
 * Returns the distance between the root bottom and element bottom edge.
 */
export function marginBottom(p: Position): number {
  return p.rootHeight - p.top - p.height;
}

/**
 * Returns the distance between the root right and element right edge.
 */
export function marginRight(p: Position): number {
  return p.rootWidth - p.left - p.width;
}
