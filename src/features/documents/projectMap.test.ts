import { describe, expect, it } from "vitest";
import { formatBytes, revisionLabel, toContractProject } from "./projectMap.ts";

describe("toContractProject", () => {
  it("mapira Convex red na ugovoreni Project", () => {
    const project = toContractProject({
      _id: "prj_1",
      name: "Objekat A, Lamela 3",
      discipline: "architecture",
      phase: "PZI",
      activeRevisionId: "rev_1",
    });
    expect(project.id).toBe("prj_1");
    expect(project.discipline).toBe("architecture");
    expect(project.active_revision_id).toBe("rev_1");
  });

  it("nepoznatu disciplinu spušta na other", () => {
    const project = toContractProject({
      _id: "prj_1",
      name: "X",
      discipline: "nuclear",
      phase: "XYZ",
      activeRevisionId: null,
    });
    expect(project.discipline).toBe("other");
    expect(project.phase).toBe("other");
  });
});

describe("labels", () => {
  it("označava krug provere, ne izmenu projekta, i veličinu", () => {
    expect(revisionLabel(2)).toBe("Provera 2");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });
});
