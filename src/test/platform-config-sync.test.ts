import { describe, it, expect } from "vitest";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { getPlatformConfig } from "@/lib/platformConfig";
import { homeTranslations } from "@/i18n/home";

describe("Platform registry sync", () => {
  it("every MANAGED_PLATFORMS key has a visual config (not default)", () => {
    for (const platform of MANAGED_PLATFORMS) {
      const cfg = getPlatformConfig(platform.key);
      // Default config uses Box icon — real configs should not
      expect(cfg.accent).not.toBe("text-muted-foreground");
    }
  });

  it("homeTranslations.features.items length matches MANAGED_PLATFORMS length", () => {
    expect(homeTranslations.fr.features.items.length).toBe(MANAGED_PLATFORMS.length);
    expect(homeTranslations.en.features.items.length).toBe(MANAGED_PLATFORMS.length);
    expect(homeTranslations.de.features.items.length).toBe(MANAGED_PLATFORMS.length);
  });

  it("getPlatformConfig returns safe default for unknown key", () => {
    const cfg = getPlatformConfig("unknown-future-platform");
    expect(cfg.icon).toBeDefined();
    expect(cfg.accent).toBe("text-muted-foreground");
    expect(cfg.featureBg).toBe("bg-muted/10");
  });

  it("platformKeySchema accepts all MANAGED_PLATFORMS keys", async () => {
    const { platformKeySchema } = await import("@/lib/validation");
    for (const platform of MANAGED_PLATFORMS) {
      const result = platformKeySchema.safeParse(platform.key);
      expect(result.success).toBe(true);
    }
  });

  it("platformKeySchema rejects unknown keys", async () => {
    const { platformKeySchema } = await import("@/lib/validation");
    const result = platformKeySchema.safeParse("nonexistent");
    expect(result.success).toBe(false);
  });
});
