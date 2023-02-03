import * as $Object from "./object.js";

/**
 * A simple URL path router that supports path patterns like
 * `thread/:threadId/page/:pageIndex`. Route segments that start with `:` match
 * any single input path segment and capture that value in `RouteMatch.params`.
 *
 * If multiple routes match the same path because of :param segments, the route
 * with an earlier literal match has the higher priority. For example, calling
 * `new Router(["a/:p1/c/d", "a/b/:p2/d"]).match("a/b/c/d")` will return
 * `{ route: "a/b/:p2/d", params: { p2: "c" } }`.
 *
 * If multiple routes match the exact same path, the Router constructor throws
 * an error.
 */
export class Router<R extends string> {
  constructor(routes: readonly R[]) {
    this.#trie = constructTrie(routes.map((pattern) => new Route(pattern)));
  }

  #trie: TrieNode;

  match(path: string): Distribute<R> | null {
    console.log(JSON.stringify(this.#trie, null, 2));
    const segments = path.split("/");
    let current = this.#trie;
    for (const segment of segments) {
      const child = current.children[segment];
      if (child) {
        current = child;
      } else if (current.children[wildcard]) {
        current = current.children[wildcard];
      } else {
        return null;
      }
    }
    if (!current.match) return null;

    return {
      route: current.match.route,
      params: $Object.map(current.match.params, (_, index) => segments[index]),
    } as Distribute<R>;
  }
}

export interface RouteMatch<R extends string> {
  readonly route: R;
  readonly params: Record<ExtractParams<R>, string>;
}

class Route {
  constructor(pattern: string) {
    const segments: (string | Wildcard)[] = [];
    const params: Record<string, number> = {};

    const patternSegments = pattern.split("/").entries();
    for (const [i, segment] of patternSegments) {
      if (segment.startsWith(":")) {
        const param = segment.substring(1);
        if (params.hasOwnProperty(param)) {
          throw new Error(
            `Route "${pattern}" contains duplicate param name "${param}".`
          );
        }
        segments.push(wildcard);
        params[param] = i;
      } else {
        segments.push(segment);
      }
    }

    this.pattern = pattern;
    this.segments = segments;
    this.params = params;
  }

  /**
   * The unaltered route pattern that was passed to `Router`.
   */
  readonly pattern: string;

  /**
   * A list of path segment matchers. Strings match themselves, `wildcard`
   * matches any single path segment.
   */
  readonly segments: readonly (string | Wildcard)[];

  /**
   * A map from param name to path segment index that gets captured and exposed.
   */
  readonly params: Readonly<Record<string, number>> = {};

  /**
   * Returns the highest priority route from `routes`, or `null` if `routes` is
   * empty. Throws an error if two routes have the same priority. All routes
   * must have the same number of segments.
   */
  static findHighestPriorityRoute(routes: readonly Route[]): Route | null {
    let best: Route | null = null;
    compareRoutes: for (const route of routes) {
      if (!best) {
        best = route;
        continue;
      }
      for (let i = 0; i < best.segments.length; i++) {
        const bestSegment = best.segments[i];
        const routeSegment = route.segments[i];
        if (bestSegment === wildcard && routeSegment !== wildcard) {
          best = route;
          continue compareRoutes;
        }
        if (bestSegment !== wildcard && routeSegment === wildcard) {
          continue compareRoutes;
        }
      }
      throw new Error(
        `Routes "${best.pattern}" and "${route.pattern}" match the same path.`
      );
    }
    return best;
  }
}

const wildcard = Symbol("*");
type Wildcard = typeof wildcard;

function constructTrie(routes: readonly Route[]): TrieNode {
  const root: TrieNode = { match: null, children: {} };
  const queue = [{ path: [] as (string | Wildcard)[], routes, node: root }];

  for (const { path, routes, node } of queue) {
    const i = path.length;
    const exactMatch: Route[] = [];
    const prefixMatch: Route[] = [];
    const nextSegments = new Set<string | Wildcard>();
    for (const route of routes) {
      if (route.segments.length === i) {
        exactMatch.push(route);
      } else {
        prefixMatch.push(route);
        nextSegments.add(route.segments[i]);
      }
    }

    const bestMatch = Route.findHighestPriorityRoute(exactMatch);
    if (bestMatch) {
      node.match = { route: bestMatch.pattern, params: bestMatch.params };
    }

    for (const segment of nextSegments) {
      const nextNode: TrieNode = { match: null, children: {} };
      node.children[segment] = nextNode;
      queue.push({
        path: [...path, segment],
        routes: routes.filter(
          (route) =>
            route.segments[i] === segment || route.segments[i] === wildcard
        ),
        node: nextNode,
      });
    }
  }

  return root;
}

interface TrieNode {
  match: {
    route: string;
    params: Record<string, number>;
  } | null;

  children: {
    [segment: string]: TrieNode;
    [wildcard]?: TrieNode;
  };
}

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types
type Distribute<R> = R extends string ? RouteMatch<R> : never;

type ExtractParams<R extends string> = R extends `/${infer Tail}`
  ? ExtractParams<Tail>
  : R extends `${infer Head}/${infer Tail}`
  ? ExtractSingleParam<Head> | ExtractParams<Tail>
  : ExtractSingleParam<R>;

type ExtractSingleParam<R extends string> = R extends `:${infer Param}`
  ? Param
  : never;
