import { describe, expect, it } from "vitest";
import { DEFAULT_NAV_ID, isNavId, resolveNavId } from "./navigation.ts";

describe("resolveNavId", () => {
  it("podrazumevano otvara Projekat", () => {
    expect(DEFAULT_NAV_ID).toBe("projekat");
    expect(resolveNavId("")).toBe("projekat");
    expect(resolveNavId("nepoznato")).toBe("projekat");
  });

  it("stare rute vode na Projekat, da postojeći linkovi ne puknu", () => {
    expect(resolveNavId("pregled")).toBe("projekat");
    expect(resolveNavId("dokumenti")).toBe("projekat");
    expect(resolveNavId("zadaci")).toBe("projekat");
    expect(resolveNavId("revizije")).toBe("projekat");
  });

  it("Moduli ostaju kao katalog", () => {
    expect(isNavId("moduli")).toBe(true);
    expect(resolveNavId("moduli")).toBe("moduli");
  });
});
