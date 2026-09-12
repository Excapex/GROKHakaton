import { describe, expect, it } from "vitest";
import { ConvexError } from "convex/values";
import {
  MODULE_CATALOG,
  SUPPORTED_DOMAIN_PACK_IDS,
  UNSUPPORTED_DOMAIN_PACK,
  buildReviewRequest,
  type ReviewRequestArgs,
} from "./domainPackRegistry";

const baseArgs: ReviewRequestArgs = {
  project_id: "prj_demo_1",
  revision_id: "rev_2",
  domain_pack_id: "fire_protection",
};

function rejectionCode(args: ReviewRequestArgs): string {
  try {
    buildReviewRequest(args);
  } catch (error) {
    expect(error).toBeInstanceOf(ConvexError);
    return (error as ConvexError<{ code: string }>).data.code;
  }
  throw new Error(`zahtev nije odbijen: ${JSON.stringify(args)}`);
}

describe("katalog modula", () => {
  it("ima tačno jedan aktivan modul", () => {
    const active = MODULE_CATALOG.filter((m) => m.availability === "active");
    expect(active.map((m) => m.domain_pack_id)).toEqual([
      ...SUPPORTED_DOMAIN_PACK_IDS,
    ]);
  });

  it("planirani moduli ne nose verziju packa, pa ne mogu da prikažu rezultat", () => {
    for (const entry of MODULE_CATALOG.filter((m) => m.availability === "planned")) {
      expect(entry.pack_version).toBeNull();
    }
  });
});

describe("buildReviewRequest", () => {
  it("prihvata aktivan modul, ali bez teksta nije pipeline spreman", () => {
    const result = buildReviewRequest(baseArgs);
    expect(result.accepted).toBe(true);
    expect(result.domain_pack_id).toBe("fire_protection");
    expect(result.pack_version).toBe("v1");
    expect(result.pipeline_ready).toBe(false);
  });

  it("pipeline_ready samo uz ingestovani tekst", () => {
    expect(buildReviewRequest(baseArgs, { hasIngestText: true }).pipeline_ready).toBe(
      true,
    );
  });

  it("odbija izmišljen domain_pack_id", () => {
    expect(rejectionCode({ ...baseArgs, domain_pack_id: "nuclear_safety" })).toBe(
      UNSUPPORTED_DOMAIN_PACK,
    );
  });

  it("odbija svaki planiran modul iz kataloga", () => {
    for (const entry of MODULE_CATALOG.filter((m) => m.availability === "planned")) {
      expect(
        rejectionCode({ ...baseArgs, domain_pack_id: entry.domain_pack_id }),
      ).toBe(UNSUPPORTED_DOMAIN_PACK);
    }
  });

  it("odbija vrednost discipline projekta poslatu kao domain_pack_id", () => {
    // `project.discipline` i `review.domain_pack_id` su odvojena polja —
    // disciplina nikad ne sme da prođe kao izbor stručnog postupka.
    for (const discipline of [
      "architecture",
      "structural",
      "electrical",
      "mechanical",
      "hydrotechnical",
      "other",
    ]) {
      expect(rejectionCode({ ...baseArgs, domain_pack_id: discipline })).toBe(
        UNSUPPORTED_DOMAIN_PACK,
      );
    }
  });

  it("odbija prazan i samo-razmak domain_pack_id", () => {
    expect(rejectionCode({ ...baseArgs, domain_pack_id: "" })).toBe(
      UNSUPPORTED_DOMAIN_PACK,
    );
    expect(rejectionCode({ ...baseArgs, domain_pack_id: "   " })).toBe(
      UNSUPPORTED_DOMAIN_PACK,
    );
  });

  it("odbija podržan id sa prefiksom ili sufiksom", () => {
    expect(
      rejectionCode({ ...baseArgs, domain_pack_id: "fire_protection_v2" }),
    ).toBe(UNSUPPORTED_DOMAIN_PACK);
    expect(rejectionCode({ ...baseArgs, domain_pack_id: "Fire_Protection" })).toBe(
      UNSUPPORTED_DOMAIN_PACK,
    );
  });

  it("odbijanje nosi listu podržanih modula, ne samo poruku", () => {
    try {
      buildReviewRequest({ ...baseArgs, domain_pack_id: "structural" });
      throw new Error("zahtev nije odbijen");
    } catch (error) {
      const data = (error as ConvexError<{ supported: string[] }>).data;
      expect(data.supported).toEqual([...SUPPORTED_DOMAIN_PACK_IDS]);
    }
  });

  it("odbija zahtev bez predmeta ili revizije", () => {
    expect(rejectionCode({ ...baseArgs, project_id: "" })).toBe(
      "invalid_review_request",
    );
    expect(rejectionCode({ ...baseArgs, revision_id: "  " })).toBe(
      "invalid_review_request",
    );
  });
});
