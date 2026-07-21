"use client";

import { useSyncExternalStore } from "react";
import { detectPlatform, type Platform } from "./platform";

// getSnapshot runs on every render, so the result is memoised to avoid
// re-running the regexes. The platform cannot change during the page's life.
let cached: Platform | undefined;
const getSnapshot = (): Platform => (cached ??= detectPlatform());

// Nothing to subscribe to. Must be module-level stable or React resubscribes
// on every render.
const subscribe = () => () => {};

// null on the server *and* on the hydration pass, so the static HTML and the
// first client render agree by construction; React then re-renders with the
// real value.
const getServerSnapshot = (): null => null;

/**
 * The visitor's platform: null until hydrated, then the detected value.
 *
 * useSyncExternalStore rather than useEffect because the app router does
 * client-side navigation — useEffect would render the neutral label and flip
 * again on every visit to the page, while this reads the snapshot immediately.
 */
export function usePlatform(): Platform | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
