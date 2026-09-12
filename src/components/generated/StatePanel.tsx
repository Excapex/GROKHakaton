/**
 * Generisano kroz Wonder, očišćeno prema docs/TOOLSTACK.md §5.
 * Jedna komponenta za sva stanja: prazno, učitavanje, greška i delimičan
 * rezultat. Nijedno stanje ne prikazuje izračunat nalaz — samo šta sistem zna.
 */

export type StatePanelTone = 'neutral' | 'progress' | 'error' | 'warning'

export type StatePanelProps = {
  tone: StatePanelTone
  /** Kratka oznaka stanja: Prazno, Učitavanje, Greška, Delimično. */
  label: string
  title: string
  message: string
  /** Mašinski kod (npr. `unsupported_domain_pack: structural`). */
  code?: string | null
  action?: { label: string; onClick: () => void }
}

const TONES: Record<
  StatePanelTone,
  { box: string; dot: string; label: string; body: string; code: string; action: string }
> = {
  neutral: {
    box: 'border-[#E1E4EA] bg-white',
    dot: 'bg-[#9AA1AE]',
    label: 'text-[#555C6B]',
    body: 'text-[#555C6B]',
    code: 'bg-[#F5F6F8] text-[#555C6B]',
    action: 'border-[#C9D4F2] text-[#1B4DD1]',
  },
  progress: {
    box: 'border-[#E1E4EA] bg-white',
    dot: 'bg-[#1B4DD1]',
    label: 'text-[#555C6B]',
    body: 'text-[#555C6B]',
    code: 'bg-[#F5F6F8] text-[#555C6B]',
    action: 'border-[#C9D4F2] text-[#1B4DD1]',
  },
  error: {
    box: 'border-[#EBC9C5] bg-[#FDF6F5]',
    dot: 'bg-[#B3261E]',
    label: 'text-[#8A3A33]',
    body: 'text-[#5F4340]',
    code: 'bg-[#F6E7E5] text-[#8A3A33]',
    action: 'border-[#EBC9C5] text-[#8A3A33]',
  },
  warning: {
    box: 'border-[#E6D6B4] bg-[#FDFAF3]',
    dot: 'bg-[#8A5A00]',
    label: 'text-[#6E4A0C]',
    body: 'text-[#5A4C33]',
    code: 'bg-[#F6EEDC] text-[#6E4A0C]',
    action: 'border-[#E6D6B4] text-[#6E4A0C]',
  },
}

export function StatePanel({ tone, label, title, message, code, action }: StatePanelProps) {
  const palette = TONES[tone]
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex h-fit min-h-[176px] flex-col gap-2 rounded-lg border p-5 ${palette.box}`}
    >
      <div className="flex h-fit flex-row items-center gap-2">
        <span aria-hidden="true" className={`h-[7px] w-[7px] shrink-0 rounded-full ${palette.dot}`} />
        <span className={`text-[12px] tracking-wide uppercase ${palette.label}`}>{label}</span>
      </div>
      <p className="text-[15px] font-medium text-[#12151B]">{title}</p>
      <p className={`text-[13px] leading-relaxed ${palette.body}`}>{message}</p>

      {tone === 'progress' ? (
        <div aria-hidden="true" className="mt-auto h-1 w-full overflow-hidden rounded-full bg-[#EDEEF1]">
          <div className="h-1 w-2/5 animate-pulse rounded-full bg-[#1B4DD1]" />
        </div>
      ) : null}

      {code ? (
        <span className={`mt-auto w-fit rounded-[3px] px-2 py-[3px] font-mono text-[12px] ${palette.code}`}>
          {code}
        </span>
      ) : null}

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className={`mt-auto flex h-8 w-fit items-center justify-center rounded-[5px] border px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4DD1] ${palette.action}`}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
