import { StatePanel } from '../../components/generated/StatePanel.tsx'

/**
 * Katalog modula je serverski podatak. Bez Convex URL-a nema ni kataloga ni
 * provere `domain_pack_id` — pa se prikazuje greška, a ne lokalna zamena.
 */
export function ModulesUnavailable() {
  return (
    <section aria-label="Stanje kataloga" className="px-4 py-9 sm:px-10">
      <div className="max-w-[520px]">
        <StatePanel
          tone="error"
          label="Greška"
          title="Backend nije podešen"
          message="Katalog stručnih modula i provera zahteva žive na serveru. Bez Convex deployment-a nema kataloga; lokalna zamena bi bila izmišljen podatak."
          code="VITE_CONVEX_URL nije postavljen"
        />
      </div>
    </section>
  )
}
