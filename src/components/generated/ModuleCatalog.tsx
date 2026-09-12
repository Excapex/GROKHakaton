/**
 * Generisano kroz Wonder, očišćeno prema docs/TOOLSTACK.md §5.
 * Komponenta ne zna ni jedan konkretan modul: sve stiže kroz `items`.
 * Planirana stavka nema mesto za rezultat, ocenu ni procenat — to polje ne postoji.
 */

export type ModuleAvailability = 'active' | 'planned'

export type ModuleCatalogItem = {
  id: string
  name: string
  availability: ModuleAvailability
  /** Verzija packa; postoji samo kod aktivnog modula. */
  version?: string | null
  scope: string
  /** Kratka napomena uz aktivan modul (npr. čime rezultat mora biti potkrepljen). */
  hint?: string
}

export type ModuleCatalogProps = {
  title: string
  subtitle: string
  items: readonly ModuleCatalogItem[]
  onStart: (moduleId: string) => void
  /** Modul čije se pokretanje upravo obrađuje. */
  pendingId?: string | null
}

const ACTIVE_LABEL = 'Aktivno'
const PLANNED_LABEL = 'Planirano'
const START_LABEL = 'Pokreni pregled'
const UNAVAILABLE_LABEL = 'Pokretanje nije dostupno'
const NO_RESULT_NOTE = 'Bez rezultata, ocene i procenta usaglašenosti.'

export function ModuleCatalog({
  title,
  subtitle,
  items,
  onStart,
  pendingId,
}: ModuleCatalogProps) {
  return (
    <section
      aria-label={title}
      className="flex h-fit flex-col gap-6 px-4 pt-9 pb-8 sm:px-10"
    >
      <div className="flex h-fit flex-col gap-2">
        <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
        <p className="max-w-[760px] text-[13px] leading-relaxed text-[#555C6B]">{subtitle}</p>
      </div>

      <ul className="grid h-fit grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const isActive = item.availability === 'active'
          const isPending = pendingId === item.id
          return (
            <li
              key={item.id}
              className={`flex h-fit min-h-[228px] flex-col gap-3 rounded-lg border p-6 ${
                isActive ? 'border-[#C9D4F2] bg-white' : 'border-[#E1E4EA] bg-[#FAFAFB]'
              }`}
            >
              <div className="flex h-fit flex-row items-center gap-2">
                <span
                  className={`rounded-[3px] px-2 py-[3px] text-[12px] font-medium tracking-wide ${
                    isActive
                      ? 'bg-[#E6F2EC] text-[#0F5A3C]'
                      : 'bg-[#EDEEF1] text-[#4B5563]'
                  }`}
                >
                  {isActive ? ACTIVE_LABEL : PLANNED_LABEL}
                </span>
                <span className="font-mono text-[12px] text-[#6B7280]">
                  {item.version ? `${item.id} · ${item.version}` : item.id}
                </span>
              </div>

              <h3
                className={`text-[17px] font-semibold tracking-tight ${
                  isActive ? 'text-[#12151B]' : 'text-[#2A2F3A]'
                }`}
              >
                {item.name}
              </h3>
              <p className="text-[13px] leading-relaxed text-[#555C6B]">{item.scope}</p>

              {isActive ? (
                <div className="mt-auto flex h-fit flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => onStart(item.id)}
                    disabled={isPending}
                    className="flex h-[38px] w-fit items-center justify-center rounded-[5px] bg-[#1B4DD1] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#1740AE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4DD1] disabled:bg-[#8AA0DE]"
                  >
                    {START_LABEL}
                  </button>
                  {item.hint ? (
                    <span className="text-[12px] text-[#6B7280]">{item.hint}</span>
                  ) : null}
                </div>
              ) : (
                <div className="mt-auto flex h-fit flex-col gap-2 pt-2">
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="flex h-[38px] w-fit cursor-not-allowed items-center justify-center rounded-[5px] border border-[#E1E4EA] bg-[#F0F1F4] px-4 text-[13px] text-[#8A91A0]"
                  >
                    {UNAVAILABLE_LABEL}
                  </button>
                  <span className="text-[12px] text-[#6B7280]">{NO_RESULT_NOTE}</span>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
