import { type ObjectMap } from "./object-map.js";
import * as $Object from "./object.js";
import * as $String from "./string.js";

/**
 * Removes all leading, trailing and double `/` characters from `path`.
 */
export function sanitizePath(path: string): string {
  return $String
    .trimEnd($String.trimStart(path, "/"), "/")
    .replaceAll(/\/{2,}/g, "");
}

/**
 * A simple URL path router that supports path patterns like
 * `thread/:threadId/page/:pageIndex` or `settings/*`.
 *
 * ## Usage
 *
 * Instantiate the router:
 *
 * ```ts
 * const router = new Router([
 *   "",
 *   "home",
 *   "artist/:artistId",
 *   "artist/:artistId/featuring",
 *   "settings/*",
 *   "*",
 * ]);
 * ```
 *
 * Match a route:
 *
 * ```ts
 * const route = "profile/pschiffmann/photos";
 * const match = router.match();
 * switch(match?.route) {
 *   case "":
 *     // Redirect to "home".
 *     break;
 *   case "home":
 *     // Render home page.
 *     break;
 *   case "artist/:artistId":
 *   case "artist/:artistId/featuring":
 *     // Render artist page.
 *     console.log(match.params.artistId);
 *     break;
 *   case "settings/*":
 *     // Render settings. If the settings module has its own nested router,
 *     // pass the captured `*` sub-path down so the module can do it's own
 *     // routing.
 *     console.log(match.params["*"]);
 *     break;
 *   case "*":
 *     // Render a 404 page.
 *     break;
 * }
 * ```
 *
 * ## Matchers
 *
 * `Router.match(path)` splits `path` at `/` and matches each path segment
 * against the routers routes. Route segments match according to these rules:
 *
 * - Route segments that start with `:` match any single input path segment and
 *   capture that value in `RouteMatch.params`.
 *   ```ts
 *   const router = new Router(["thread/:threadId/page/:index"]);
 *   const match = router.match("thread/abcdef/page/4");
 *   // match.params === { threadId: "abcdef", index: "4" }
 *   ```
 *
 * - A splat `*` route segment can only appear at the end of a route, and
 *   matches all trailing path segments, including none.
 *
 *   ```ts
 *   const router = new Router(["settings/*"]);
 *
 *   const match1 = router.match("settings");
 *   // match1.paras === {}
 *
 *   const match2 = router.match("settings/");
 *   // match2.params === { "*": "" }
 *
 *   const match3 = router.match("settings/account/privacy");
 *   // match3.params === { "*": "account/privacy" }
 *   ```
 *
 * Paths should not start or end with a `/`, as that will be interpreted as a
 * trailing empty string that won't match any route. It is recommended to call
 * `Router.match(sanitizePath(path))`.
 *
 * ## Precedence
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

  /**
   * This method assumes that `path` doesn't start or end with `/`. For example,
   * if `path` starts with `/`, that will be interpreted as an empty first path
   * segment, and no route will match. Use `sanitizePath()` before calling this
   * method.
   */
  match(path: string): Distribute<R> | null {
    // console.log(JSON.stringify(this.#trie, null, 2));
    const segments = path.split("/");
    let current = this.#trie;
    let subPath: string | undefined;
    for (const [i, segment] of segments.entries()) {
      const child = current.children[segment];
      if (child) {
        current = child;
      } else if (current.children[param]) {
        current = current.children[param];
      } else if (current.matchesSubPaths) {
        subPath = segments.slice(i).join("/");
        break;
      } else {
        return null;
      }
    }
    if (!current.match) return null;

    return {
      route: current.match.route,
      params: {
        ...$Object.map(current.match.params, (_, index) => segments[index]),
        ...(subPath && { "*": subPath }),
      },
    } as Distribute<R>;
  }
}

export interface RouteMatch<R extends string> {
  readonly route: R;
  readonly params: Readonly<Record<ExtractParams<R>, string>>;
}

class Route {
  constructor(pattern: string) {
    if (
      pattern.startsWith("/") ||
      pattern.endsWith("/") ||
      pattern.includes("//")
    ) {
      throw new Error(
        `Invalid route '${pattern}': Routes must not start or end with '/', ` +
          `or contain empty path segments.`,
      );
    }
    const patternSegments = pattern.split("/");

    const segments: (string | Param)[] = [];
    const params: Record<string, number> = {};
    let matchesSubPaths = false;

    if (patternSegments.at(-1) === "*") {
      patternSegments.pop();
      matchesSubPaths = true;
    }
    for (const [i, segment] of patternSegments.entries()) {
      if (segment === "*") {
        throw new Error(
          `Invalid route '${pattern}': A wildcard matcher '*' can only occur ` +
            `as the last route segment.`,
        );
      } else if (segment.startsWith(":")) {
        const param = segment.substring(1);
        if (params.hasOwnProperty(param)) {
          throw new Error(
            `Invalid route '${pattern}': Contains duplicate param ':${param}'.`,
          );
        }
        segments.push(param);
        params[param] = i;
      } else {
        segments.push(segment);
      }
    }

    this.pattern = pattern;
    this.segments = segments;
    this.params = params;
    this.matchesSubPaths = matchesSubPaths;
  }

  /**
   * The unaltered route pattern that was passed to `Router`.
   */
  readonly pattern: string;

  /**
   * A list of path segment matchers. Strings match themselves, `wildcard`
   * matches any single path segment.
   */
  readonly segments: readonly (string | Param)[];

  /**
   * A map from param name to path segment index that gets captured and exposed.
   */
  readonly params: ObjectMap<number>;

  /**
   * This is `true` if `pattern` ends with `.../*`.
   */
  readonly matchesSubPaths: boolean;

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
        if (bestSegment === param && routeSegment !== param) {
          best = route;
          continue compareRoutes;
        }
        if (bestSegment !== param && routeSegment === param) {
          continue compareRoutes;
        }
      }
      throw new Error(
        `Routes '${best.pattern}' and '${route.pattern}' match the same path.`,
      );
    }
    return best;
  }
}

const param = Symbol(":param");
type Param = typeof param;

const splat = Symbol("*");
type Splat = typeof splat;

function constructTrie(routes: readonly Route[]): TrieNode {
  const root: TrieNode = { match: null, children: {} };
  const queue = [{ path: [] as (string | Param)[], routes, node: root }];

  for (const { path, routes, node } of queue) {
    const i = path.length;
    const exactMatch: Route[] = [];
    const prefixMatch: Route[] = [];
    const nextSegments = new Set<string | Param>();
    for (const route of routes) {
      if (
        route.segments.length === i ||
        (i > route.segments.length && route.matchesSubPaths)
      ) {
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
            route.segments[i] === segment || route.segments[i] === param,
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
    params: ObjectMap<number>;
  } | null;

  matchesSubPaths: boolean;

  children: {
    [segment: string]: TrieNode;
    [param]?: TrieNode;
  };
}

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types
type Distribute<R> = R extends string ? RouteMatch<R> : never;

type ExtractParams<R extends string> = string extends R
  ? string
  : R extends `${infer Head}/${infer Tail}`
  ? ExtractSingleParam<Head> | ExtractParams<Tail>
  : ExtractSingleParam<R>;

type ExtractSingleParam<R extends string> = R extends `:${infer Param}`
  ? Param
  : never;

const r = new Router([
  "explore",
  "exlore/posts",
  "explore/tag",
  "explore/tag/:tag",
  ":user/",
  ":user/:statusId",
  ":user/media",
  "me/*",
]);

const m = r.match("foo/bar");
console.log(m);
if (m?.route === ":user/:statusId") {
  m.params.user;
}
if (m?.route === "me/*") {
  // m["*"];
}
