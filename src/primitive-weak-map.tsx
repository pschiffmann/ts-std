/**
 * A WeakMap that supports primitive values like strings or numbers as keys.
 * Inspired by
 * [this MDN example](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management#weakrefs_and_finalizationregistry).
 */
export class PrimitiveWeakMap<K extends string | number, V extends object> {
  #entries = new Map<K, Entry<V>>();
  #registry = new FinalizationRegistry<K>((key) => this.delete(key));

  /**
   * Same as
   * [WeakMap.delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/delete).
   */
  delete(key: K): boolean {
    const entry = this.#entries.get(key);
    if (entry) this.#registry.unregister(entry.token);
    return this.#entries.delete(key);
  }

  /**
   * Same as
   * [WeakMap.get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/get).
   */
  get(key: K): V | undefined {
    return this.#entries.get(key)?.value.deref();
  }

  /**
   * Same as
   * [WeakMap.has](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/has).
   */
  has(key: K): boolean {
    const entry = this.#entries.get(key);
    return !!entry && entry.value.deref() !== undefined;
  }

  /**
   * Same as
   * [WeakMap.set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/set).
   */
  set(key: K, value: V): this {
    this.delete(key);
    const token = {};
    this.#entries.set(key, { token, value: new WeakRef(value) });
    this.#registry.register(value, key, token);
    return this;
  }
}

interface Entry<V extends object> {
  readonly token: {};
  readonly value: WeakRef<V>;
}
