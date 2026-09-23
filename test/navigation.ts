import { useSyncExternalStore } from "react";
import { vi } from "vitest";

let pathname = "/new";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function navigate(href: string) {
  pathname = href;
  listeners.forEach((listener) => listener());
}

export const router = {
  push: vi.fn(navigate),
  replace: vi.fn(navigate),
};

export const useRouter = () => router;

export function usePathname() {
  return useSyncExternalStore(subscribe, () => pathname);
}

export function resetRouter() {
  router.push.mockClear();
  router.replace.mockClear();
  pathname = "/new";
}
