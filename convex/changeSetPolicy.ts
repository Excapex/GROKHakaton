import { isCadKind } from "./filePolicy";

/** CAD never gets a Patch. S10 only records the task; S12 writes a real file change. */
export function designTaskForDocument(
  kind: string,
  filename: string,
): string | undefined {
  if (!isCadKind(kind)) return undefined;
  return `CAD izvor ${filename} se ne krpi. Izmena ostaje projektantski zadatak.`;
}
