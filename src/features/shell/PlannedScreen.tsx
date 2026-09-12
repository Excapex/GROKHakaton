import { StatePanel } from '../../components/generated/StatePanel.tsx'

const SCREENS: Record<string, { title: string; message: string }> = {
  pregled: {
    title: 'Pregled predmeta još nije implementiran',
    message:
      'Zbirni pregled dolazi kada dosije (#10) dobije stvarne nalaze. Do tada ovde nema ni jednog izračunatog podatka.',
  },
  dokumenti: {
    title: 'Dokumenti još nisu implementirani',
    message: 'Upload, hash i čuvanje originala stižu sa #4 (S03).',
  },
  zadaci: {
    title: 'Zadaci još nisu implementirani',
    message:
      'Pitanja, prihvatanje i projektantski zadaci stižu sa #11 (S10) i #12 (S11).',
  },
  revizije: {
    title: 'Revizije još nisu implementirane',
    message: 'Lista revizija i poređenje stižu sa #4 (S03) i #15 (S14).',
  },
}

export function PlannedScreen({ navId }: { navId: string }) {
  const screen = SCREENS[navId]
  return (
    <section aria-label="Stanje ekrana" className="px-4 py-9 sm:px-10">
      <div className="max-w-[520px]">
        <StatePanel
          tone="neutral"
          label="Prazno"
          title={screen?.title ?? 'Ekran još nije implementiran'}
          message={
            screen?.message ??
            'Ovaj deo radnog prostora još nema implementaciju i ne prikazuje nikakav rezultat.'
          }
        />
      </div>
    </section>
  )
}
