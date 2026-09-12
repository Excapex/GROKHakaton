import { describe, expect, it } from "vitest";
import {
  EMPTY_DOSSIER_REASON,
  WAITING_INGEST_REASON,
  chooseDossierSource,
  pickRevisionWithText,
} from "./dossierSource.ts";

describe("chooseDossierSource", () => {
  it("ingest tekst uvek pobeđuje fixture", () => {
    expect(
      chooseDossierSource({
        hasIngestText: true,
        hasUploadedDocuments: true,
        demoKey: "objekat-a",
      }),
    ).toEqual({ kind: "ingest" });
  });

  it("uploadovani dokumenti nikad ne dobijaju anon fixture", () => {
    expect(
      chooseDossierSource({
        hasIngestText: false,
        hasUploadedDocuments: true,
        demoKey: "objekat-a",
      }),
    ).toEqual({ kind: "none", reason: WAITING_INGEST_REASON });
  });

  it("poruka ingest_failed ostaje, bez primera", () => {
    expect(
      chooseDossierSource({
        hasIngestText: false,
        hasUploadedDocuments: true,
        demoKey: "objekat-a",
        ingestEventType: "ingest_failed",
        ingestEventMessage: "Daytona sandbox exit 1. Nema izmišljenih strana.",
      }),
    ).toEqual({
      kind: "none",
      reason: "Daytona sandbox exit 1. Nema izmišljenih strana.",
    });
  });

  it("fixture samo za demo bez dokumenata", () => {
    expect(
      chooseDossierSource({
        hasIngestText: false,
        hasUploadedDocuments: false,
        demoKey: "objekat-a",
      }),
    ).toEqual({ kind: "anon_fixture" });
  });

  it("prazan predmet bez demo ključa ostaje prazan", () => {
    expect(
      chooseDossierSource({
        hasIngestText: false,
        hasUploadedDocuments: false,
      }),
    ).toEqual({ kind: "none", reason: EMPTY_DOSSIER_REASON });
  });
});

describe("pickRevisionWithText", () => {
  const revisions = [
    { id: "r1", index: 1 },
    { id: "r2", index: 2 },
    { id: "r3", index: 3 },
  ];

  it("drži aktivnu ako ima tekst", () => {
    expect(
      pickRevisionWithText("r3", revisions, (id) => id === "r3"),
    ).toBe("r3");
  });

  it("prazna aktivna provera čita poslednju sa tekstom", () => {
    expect(
      pickRevisionWithText("r3", revisions, (id) => id === "r1"),
    ).toBe("r1");
  });
});
