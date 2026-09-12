import { describe, expect, it } from "vitest";
import { ingestUnavailableReason } from "./client";
import {
  ingestGate,
  pagesFromExtractJson,
  remoteIngestName,
  skipCadResult,
  unavailableResult,
} from "./ingestResult";

const page1 = "Saglasnik anon fixture page 1\nEI 60 SRPS EN 13501-2\n";
const page2 = "";

describe("ingestGate", () => {
  it("CAD ne izmišlja strane", () => {
    expect(ingestGate({ parsePolicy: "store_only", daytonaConfigured: true })).toEqual({
      action: "skip_cad",
    });
    expect(skipCadResult().pages).toEqual([]);
  });

  it("bez Daytona ključa ne izmišlja page_no", () => {
    const gate = ingestGate({ parsePolicy: "ingest", daytonaConfigured: false });
    expect(gate.action).toBe("unavailable");
    if (gate.action === "unavailable") {
      expect(gate.reason).toBe(ingestUnavailableReason());
    }
    expect(unavailableResult(ingestUnavailableReason()).pages).toEqual([]);
  });

  it("sa ključem dozvoljava run, bez lažnog teksta ovde", () => {
    expect(ingestGate({ parsePolicy: "ingest", daytonaConfigured: true })).toEqual({
      action: "run",
    });
  });

  it("remote ime prati ekstenziju, CAD nije ingest putanja", () => {
    expect(remoteIngestName("anon-gpzop.pdf")).toBe("tmp/ingest.pdf");
    expect(remoteIngestName("anon-gpzop.docx")).toBe("tmp/ingest.docx");
    expect(remoteIngestName("anon-predmer.xlsx")).toBe("tmp/ingest.xlsx");
    expect(remoteIngestName("tlocrt.dwg")).toBeNull();
  });
});

describe("pagesFromExtractJson", () => {
  it("anon-two-page: strana 1 full, strana 2 partial, page_no iz manifesta", () => {
    const pages = pagesFromExtractJson({
      pages: [
        { page_no: 1, readability: "full", text: page1 },
        { page_no: 2, readability: "partial", text: page2 },
      ],
    });
    expect(pages).toHaveLength(2);
    expect(pages[0]?.page_no).toBe(1);
    expect(pages[0]?.readability).toBe("full");
    expect(pages[0]?.text).toMatch(/EI 60/);
    expect(pages[1]?.page_no).toBe(2);
    expect(pages[1]?.readability).toBe("partial");
  });

  it("odbacuje page_no 0 i ne-ceo broj", () => {
    expect(
      pagesFromExtractJson({
        pages: [
          { page_no: 0, text: "laž", readability: "full" },
          { page_no: 1.5, text: "laž", readability: "full" },
          { page_no: 1, text: "ok", readability: "partial" },
        ],
      }),
    ).toEqual([{ page_no: 1, text: "ok", readability: "partial" }]);
  });

  it("prazan ili loš JSON → nula strana", () => {
    expect(pagesFromExtractJson(null)).toEqual([]);
    expect(pagesFromExtractJson({})).toEqual([]);
    expect(pagesFromExtractJson("nope")).toEqual([]);
  });
});
