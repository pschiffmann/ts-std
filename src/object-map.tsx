/**
 * An `ObjectMap` is a plain JS object `{}` that is used as a `Map<string, V>`.
 */
export interface ObjectMap<V> {
  readonly [key: string]: V;
}
