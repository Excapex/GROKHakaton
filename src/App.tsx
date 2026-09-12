const NAV = ['Pregled', 'Dokumenti', 'Zadaci', 'Revizije', 'Moduli'] as const

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-baseline gap-4 px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">Saglasnik</h1>
          <p className="text-sm text-neutral-500">Kopilot za tehničke projekte</p>
        </div>
        <nav className="mx-auto max-w-6xl px-6">
          <ul className="flex gap-6 text-sm">
            {NAV.map((item) => (
              <li key={item} className="border-b-2 border-transparent pb-3 text-neutral-500">
                {item}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="rounded-lg border border-dashed border-neutral-300 p-10 dark:border-neutral-700">
          <h2 className="text-base font-medium">Nema otvorenih projekata</h2>
          <p className="mt-2 max-w-prose text-sm text-neutral-500">
            Radni prostor je postavljen, ali pregled dokumentacije još nije implementiran.
            Nijedan stručni rezultat nije izračunat i ništa na ovoj strani nije demonstracioni
            podatak.
          </p>
          <p className="mt-6 text-xs text-neutral-400">
            Aktivan stručni modul: Zaštita od požara (u izradi). Ostale discipline: planirano.
          </p>
        </section>
      </main>
    </div>
  )
}
