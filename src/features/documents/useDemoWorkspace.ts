import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const STORAGE_KEY = "saglasnik.izabraniPredmet";

function readStored(): Id<"projects"> | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (value as Id<"projects">) : null;
  } catch {
    // Privatni prozor ili blokirano skladište: izbor važi samo za ovu sesiju.
    return null;
  }
}

/**
 * Radni prostor jednog predmeta. Predmet se bira eksplicitno i izbor preživi
 * osvežavanje; demo predmet je samo podrazumevani, ne i jedini.
 */
export function useWorkspace() {
  const projects = useQuery(api.projects.list);
  const ensureDemo = useMutation(api.projects.ensureDemo);
  const [selectedId, setSelectedId] = useState<Id<"projects"> | null>(readStored);
  const [chosenHere, setChosenHere] = useState(false);

  useEffect(() => {
    void ensureDemo();
  }, [ensureDemo]);

  /**
   * Zapamćen predmet je mogao biti obrisan ili doći sa drugog deploymenta.
   * Provera važi samo za vrednost pročitanu iz skladišta: predmet izabran u
   * ovoj sesiji se ne odbacuje dok se spisak osvežava, da novi predmet ne
   * odskoči nazad na demo.
   */
  const stale =
    !chosenHere &&
    selectedId !== null &&
    projects !== undefined &&
    !projects.some((row) => row._id === selectedId);
  const effectiveId = stale ? null : selectedId;

  const select = useCallback((projectId: Id<"projects">) => {
    setSelectedId(projectId);
    setChosenHere(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, projectId);
    } catch {
      // Bez trajnog izbora aplikacija i dalje radi, samo se ne pamti.
    }
  }, []);

  const workspace = useQuery(
    api.projects.getWorkspace,
    effectiveId ? { projectId: effectiveId } : {},
  );

  return { projects: projects ?? [], workspace, selectedId: effectiveId, select };
}
