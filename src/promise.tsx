export type Resolve<T> = (value: T | PromiseLike<T>) => void;
export type Reject = (reason?: any) => void;

/**
 * Creates a new `Promise`. Returns the promise along with the `resolve` and
 * `reject` functions that are passed to the constructor callback.
 */
export function create<T = void>(): [Promise<T>, Resolve<T>, Reject] {
  let _resolve: Resolve<T>, _reject: Reject;
  const promise = new Promise<T>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });
  return [promise, _resolve!, _reject!];
}

/**
 * Returns a new promise that succeeds after `ms` milliseconds.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
