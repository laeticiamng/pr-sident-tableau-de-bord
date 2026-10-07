import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePageMeta } from "@/hooks/usePageMeta";

describe("usePageMeta — titre du document", () => {
  it("ajoute la marque « — MNG » à un titre de page ordinaire", () => {
    renderHook(() => usePageMeta({ title: "Contact" }));
    expect(document.title).toBe("Contact — MNG");
  });

  it("ne double pas la marque quand le titre commence déjà par « MNG »", () => {
    renderHook(() =>
      usePageMeta({ title: "MNG — des outils pour rendre les choses complexes plus simples" }),
    );
    expect(document.title).toBe("MNG — des outils pour rendre les choses complexes plus simples");
  });
});
