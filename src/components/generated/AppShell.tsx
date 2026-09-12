import type { ReactNode } from 'react'

/**
 * Generisano kroz Wonder (artboard „Saglasnik Moduli Desktop"), pa očišćeno
 * prema docs/TOOLSTACK.md §5: bez convex importa, bez import.meta.env, bez
 * dohvatanja podataka. Samo typed props i callback-ovi.
 */

export type NavItem = {
  id: string
  label: string
}

export type ProjectFact = {
  id: string
  label: string
  value: string
  /** Mašinska vrednost polja (npr. `architecture`, `fire_protection v1`). */
  code?: string
  /** Kom entitetu polje pripada — predmetu ili pregledu. */
  note?: string
}

export type AppShellProps = {
  appName: string
  tagline: string
  navItems: readonly NavItem[]
  activeNavId: string
  onNavigate: (navId: string) => void
  projectTitle: string | null
  projectCode?: string | null
  facts?: readonly ProjectFact[]
  factsNote?: string
  /** Vidljiva oznaka da su prikazani ulazi razvojni fixture, a ne stvaran predmet. */
  fixtureLabel?: string
  account?: { initials: string; name: string }
  children: ReactNode
}

export function AppShell({
  appName,
  tagline,
  navItems,
  activeNavId,
  onNavigate,
  projectTitle,
  projectCode,
  facts = [],
  factsNote,
  fixtureLabel,
  account,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-[#12151B]">
      <header className="flex h-16 shrink-0 flex-row items-center gap-4 border-b border-[#E1E4EA] px-4 sm:gap-6 sm:px-10">
        <div className="flex shrink-0 flex-col sm:flex-row sm:items-baseline sm:gap-3">
          <span className="text-[17px] font-semibold tracking-tight">{appName}</span>
          <span className="hidden text-[13px] text-[#555C6B] sm:inline">{tagline}</span>
        </div>
        <div className="flex-1" />
        {fixtureLabel ? (
          <span className="flex h-[26px] shrink-0 items-center gap-2 rounded border border-[#E1E4EA] bg-[#F5F6F8] px-3">
            <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-[#9AA1AE]" />
            <span className="font-mono text-[12px] tracking-wide text-[#555C6B] uppercase">
              {fixtureLabel}
            </span>
          </span>
        ) : null}
        {account ? (
          <span className="flex shrink-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#12151B] text-[12px] font-medium text-white"
            >
              {account.initials}
            </span>
            <span className="hidden text-[13px] sm:inline">{account.name}</span>
          </span>
        ) : null}
      </header>

      {projectTitle ? (
        <section
          aria-label="Zaglavlje predmeta"
          className="flex h-fit shrink-0 flex-col gap-5 px-4 pt-8 pb-6 sm:px-10"
        >
          <div className="flex h-fit flex-col gap-3 sm:flex-row sm:items-center">
            <h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">
              {projectTitle}
            </h1>
            {projectCode ? (
              <span className="w-fit rounded-[3px] border border-[#E1E4EA] bg-[#F5F6F8] px-2 py-[2px] font-mono text-[12px] text-[#555C6B]">
                {projectCode}
              </span>
            ) : null}
          </div>

          {facts.length > 0 ? (
            <dl className="grid h-fit grid-cols-1 gap-px overflow-hidden rounded-md border border-[#E1E4EA] bg-[#E1E4EA] sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.id} className="flex h-fit flex-col gap-1 bg-white px-5 py-4">
                  <dt className="text-[12px] tracking-wide text-[#555C6B] uppercase">
                    {fact.label}
                  </dt>
                  <dd className="flex flex-col gap-1">
                    <span className="text-[15px] font-medium">{fact.value}</span>
                    {fact.code ? (
                      <span className="font-mono text-[12px] text-[#6B7280]">{fact.code}</span>
                    ) : null}
                    {fact.note ? (
                      <span className="text-[12px] text-[#6B7280]">{fact.note}</span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {factsNote ? (
            <p className="max-w-[820px] text-[13px] leading-relaxed text-[#555C6B]">{factsNote}</p>
          ) : null}
        </section>
      ) : null}

      <nav
        aria-label="Glavna navigacija"
        className="flex h-11 shrink-0 flex-row items-end overflow-x-auto border-b border-[#E1E4EA] px-4 sm:px-10"
      >
        <ul className="flex h-11 flex-row items-end gap-5 sm:gap-7">
          {navItems.map((item) => {
            const isActive = item.id === activeNavId
            return (
              <li key={item.id} className="h-full">
                <button
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onNavigate(item.id)}
                  className={`flex h-full shrink-0 items-center border-b-2 text-[14px] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4DD1] ${
                    isActive
                      ? 'border-[#1B4DD1] font-medium text-[#12151B]'
                      : 'border-transparent text-[#555C6B] hover:text-[#12151B]'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <main className="flex h-fit flex-1 flex-col">{children}</main>
    </div>
  )
}
