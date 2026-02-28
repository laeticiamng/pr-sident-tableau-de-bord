/**
 * Test de synchronisation entre RUN_TYPES_REGISTRY (client) et RUN_TYPE_CONFIG (run-engine)
 * Garantit que les deux sources restent alignées (29/29 run types).
 */
import { describe, it, expect } from "vitest";
import { RUN_TYPES_REGISTRY, ALL_RUN_TYPES } from "@/lib/run-types-registry";
import { RUN_TYPE_CONFIG } from "@/lib/run-engine";

describe("Run Types Sync: registry ↔ run-engine", () => {
  const registryKeys = Object.keys(RUN_TYPES_REGISTRY).sort();
  const engineKeys = Object.keys(RUN_TYPE_CONFIG).sort();

  it("registry and engine have the same number of run types", () => {
    expect(registryKeys.length).toBe(engineKeys.length);
  });

  it("every registry key exists in run-engine", () => {
    for (const key of registryKeys) {
      expect(RUN_TYPE_CONFIG).toHaveProperty(key);
    }
  });

  it("every run-engine key exists in registry", () => {
    for (const key of engineKeys) {
      expect(RUN_TYPES_REGISTRY).toHaveProperty(key);
    }
  });

  it("ALL_RUN_TYPES matches registry keys", () => {
    expect([...ALL_RUN_TYPES].sort()).toEqual(registryKeys);
  });

  it("has exactly 29 run types", () => {
    expect(registryKeys.length).toBe(29);
  });
});
