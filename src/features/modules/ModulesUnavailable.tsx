import { StatePanel } from "../../components/generated/StatePanel.tsx";

/**
 * Katalog modula je serverski podatak. Bez Convex URL-a nema ni kataloga ni
 * provere `domain_pack_id` — pa se prikazuje greška, a ne lokalna zamena.
 */
export function ModulesUnavailable() {
  return (
    <section aria-label="Stanje kataloga" className="page-content">
      <div className="page-heading">
        <h2>Stručni moduli</h2>
        <p>
          Različite discipline. Jedan prostor za precizan pregled dokumentacije.
        </p>
      </div>
      <div>
        <StatePanel
          tone="error"
          label="Greška"
          title="Katalog trenutno nije dostupan"
          message="Veza sa servisom za stručne module nije podešena. Administrator radnog prostora treba da poveže servis pre pokretanja pregleda."
          code="VITE_CONVEX_URL nije postavljen"
        />
      </div>
    </section>
  );
}
