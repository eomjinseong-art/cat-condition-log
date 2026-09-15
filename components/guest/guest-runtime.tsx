"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { GatedFeature } from "@/lib/guest";
import {
  acceptGuestDisclaimer,
  addGuestCat,
  applyGuestLogPatch,
  clearGuestSnapshot,
  deleteGuestCat,
  emptyGuestSnapshot,
  loadGuestSnapshot,
  persistGuestSnapshot,
  selectGuestCat,
  updateGuestCat,
  type GuestCatInput,
  type GuestLogPatch,
  type GuestSnapshot,
} from "@/lib/guest-store";

let memory = emptyGuestSnapshot();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  memory = loadGuestSnapshot();
  hydrated = true;
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  hydrate();
  return memory;
}

function replaceSnapshot(next: GuestSnapshot) {
  memory = next;
  persistGuestSnapshot(next);
  emit();
}

export function useGuestHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function useGuestSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, emptyGuestSnapshot);
}

export function peekGuestSnapshot() {
  hydrate();
  return memory;
}

export function resetGuestMemory(next = emptyGuestSnapshot()) {
  memory = next;
  hydrated = true;
  persistGuestSnapshot(next);
  emit();
}

export function forgetGuestMemory() {
  memory = emptyGuestSnapshot();
  hydrated = true;
  clearGuestSnapshot();
  emit();
}

type GuestGateValue = {
  feature: GatedFeature | null;
  openGate: (feature: GatedFeature) => void;
  closeGate: () => void;
};

const GuestGateContext = createContext<GuestGateValue | null>(null);

export function GuestGateProvider({ children }: { children: ReactNode }) {
  const [feature, setFeature] = useState<GatedFeature | null>(null);
  const openGate = useCallback((next: GatedFeature) => setFeature(next), []);
  const closeGate = useCallback(() => setFeature(null), []);
  const value = useMemo<GuestGateValue>(
    () => ({ feature, openGate, closeGate }),
    [closeGate, feature, openGate],
  );

  return <GuestGateContext.Provider value={value}>{children}</GuestGateContext.Provider>;
}

export function useGuestGate() {
  const ctx = useContext(GuestGateContext);
  if (!ctx) {
    throw new Error("useGuestGate must be used within GuestGateProvider");
  }
  return ctx;
}

export function useGuestActions() {
  const snapshot = useGuestSnapshot();

  return {
    snapshot,
    acceptDisclaimer() {
      replaceSnapshot(acceptGuestDisclaimer(getSnapshot()));
    },
    selectCat(catId: string) {
      replaceSnapshot(selectGuestCat(getSnapshot(), catId));
    },
    addCat(input: GuestCatInput) {
      replaceSnapshot(addGuestCat(getSnapshot(), input));
    },
    updateCat(catId: string, input: GuestCatInput) {
      replaceSnapshot(updateGuestCat(getSnapshot(), catId, input));
    },
    deleteCat(catId: string) {
      replaceSnapshot(deleteGuestCat(getSnapshot(), catId));
    },
    saveLog(patch: GuestLogPatch) {
      const result = applyGuestLogPatch(getSnapshot(), patch);
      replaceSnapshot(result.snapshot);
      return result.log;
    },
    clearAll() {
      forgetGuestMemory();
    },
  };
}
