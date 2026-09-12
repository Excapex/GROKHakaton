import { describe, expect, it } from "vitest";
import {
  elementLabel,
  eventLabel,
  findingOrdinal,
  findingTitle,
  observationValue,
  parsePolicyLabel,
  slotLabel,
} from "./engineLabels.ts";

/**
 * Ugovor ovog rečnika: nijedan interni identifikator ne sme da procuri na
 * ekran, i nijedna mapa ne sme da vrati prazan string za nepoznat kod.
 */

const ENGINE_SLOTS = [
  "fire_resistance_mark",
  "fire_resistance_standard",
  "facade_insulation_material",
  "gpzop_element_in_predmer",
  "emergency_lighting_photometry",
  "occupant_load_vs_area",
];

const ENGINE_EVENTS = [
  "document_uploaded",
  "design_task",
  "revision_created",
  "question_asked",
  "question_answered",
  "changeset_proposed",
  "changeset_accepted",
];

describe("slotLabel", () => {
  it("prevodi svaki slot koji engine zaista upisuje", () => {
    for (const slot of ENGINE_SLOTS) {
      const label = slotLabel(slot);
      expect(label).not.toContain("_");
      expect(label).not.toBe(slot);
    }
  });

  it("nepoznat slot ne ostavlja prazno polje", () => {
    expect(slotLabel("sprinkler_head_spacing")).toBe("Sprinkler head spacing");
    expect(slotLabel("")).toBe("");
  });
});

describe("observationValue", () => {
  it("F60 sa jedinicom class postaje oznaka, ne klasa", () => {
    expect(observationValue("F60", "class")).toBe("oznaka F60");
  });

  it("kodirane vrednosti dobijaju srpski tekst", () => {
    expect(observationValue("present", null)).toBe("priloženo");
    expect(observationValue("mineral_wool", "material")).toBe("mineralna vuna");
    expect(observationValue("decorative_render", "material")).toBe(
      "dekorativni malter",
    );
  });

  it("A1 se čita kao klasa reakcije na požar", () => {
    expect(observationValue("A1", "reaction_to_fire")).toBe(
      "klasa A1 (reakcija na požar)",
    );
  });

  it("null vrednost kaže da podatak nije pronađen, ne prazno", () => {
    expect(observationValue(null)).toBe("nije pronađeno u dokumentaciji");
    expect(observationValue("")).toBe("nije pronađeno u dokumentaciji");
  });

  it("kvadratni metri se pišu kao m²", () => {
    expect(observationValue("180 m2 / 90 lica", "m2")).toBe("180 m² / 90 lica");
  });

  it("engleska fraza iz engine-a se prevodi", () => {
    expect(observationValue("EI cited against SRPS EN 13501-1", null)).toBe(
      "EI oznaka pozvana na SRPS EN 13501-1",
    );
  });
});

describe("elementLabel", () => {
  it("prevodi tačkaste identifikatore elemenata", () => {
    expect(elementLabel("facade.insulation")).toBe("fasadna izolacija");
    expect(elementLabel("element.gpzop")).toBe("element iz GPZOP");
    expect(elementLabel("space.unspecified")).toBe("prostor nije bliže određen");
  });

  it("prazan element se ne prikazuje", () => {
    expect(elementLabel(null)).toBeNull();
    expect(elementLabel(undefined)).toBeNull();
  });
});

describe("eventLabel", () => {
  it("prevodi svaki tip koji Convex mutacije upisuju", () => {
    for (const type of ENGINE_EVENTS) {
      const label = eventLabel(type);
      expect(label).not.toContain("_");
      expect(label).not.toBe(type);
    }
  });
});

describe("parsePolicyLabel", () => {
  it("store_only dobija objašnjenje na srpskom", () => {
    expect(parsePolicyLabel("store_only")).toBe(
      "Samo pohranjeno, bez čitanja sadržaja",
    );
  });

  it("ingest nema oznaku jer je podrazumevan", () => {
    expect(parsePolicyLabel("ingest")).toBeNull();
  });
});

describe("findingTitle", () => {
  const ids = ["find_r1", "find_r3", "find_r5"];

  it("interni ID postaje redni broj primedbe", () => {
    expect(findingTitle("find_r1", ids)).toBe("Primedba 1");
    expect(findingTitle("find_r3", ids)).toBe("Primedba 2");
    expect(findingTitle("find_r5", ids)).toBe("Primedba 3");
  });

  it("nalaz van liste se ne prikazuje kao nulti", () => {
    expect(findingOrdinal("find_r9", ids)).toBe(1);
  });

  it("nijedan naslov ne sadrži interni ID", () => {
    for (const id of ids) {
      expect(findingTitle(id, ids)).not.toContain(id);
    }
  });
});
