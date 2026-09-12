import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { api } from '../../../convex/_generated/api'
import type { ModuleCatalogEntry } from '../../../convex/domainPackRegistry.ts'
import { ModuleCatalog } from '../../components/generated/ModuleCatalog.tsx'
import type { ModuleCatalogItem } from '../../components/generated/ModuleCatalog.tsx'
import { StatePanel } from '../../components/generated/StatePanel.tsx'
import type { StatePanelProps } from '../../components/generated/StatePanel.tsx'
import type { SelectedReviewModule } from '../shell/projectFacts.ts'

const CATALOG_TITLE = 'Katalog stručnih modula'
const CATALOG_SUBTITLE =
  'Katalog stiže sa servera. Planirani moduli ne pokreću pregled i ne prikazuju rezultat, ocenu ni procenat usaglašenosti.'
const ACTIVE_HINT = 'Rezultat mora nositi dokaz sa brojem strane'

type RequestState =
  | { kind: 'idle' }
  | { kind: 'running'; moduleId: string; moduleName: string }
  | { kind: 'accepted'; moduleName: string; message: string }
  | { kind: 'rejected'; message: string; code: string | null }

export type ModulesPageProps = {
  projectId: string
  revisionId: string | null
  onReviewAccepted: (module: SelectedReviewModule) => void
}

function toCatalogItem(entry: ModuleCatalogEntry): ModuleCatalogItem {
  return {
    id: entry.domain_pack_id,
    name: entry.name,
    availability: entry.availability,
    version: entry.pack_version,
    scope: entry.scope,
    hint: entry.availability === 'active' ? ACTIVE_HINT : undefined,
  }
}

function describeError(error: unknown): { message: string; code: string | null } {
  if (error instanceof ConvexError) {
    const data = error.data as
      | { code?: string; message?: string; domain_pack_id?: string }
      | string
    if (typeof data === 'object' && data !== null) {
      const code =
        data.code && data.domain_pack_id
          ? `${data.code}: ${data.domain_pack_id}`
          : (data.code ?? null)
      return {
        message: data.message ?? 'Backend je odbio zahtev.',
        code,
      }
    }
    return { message: String(data), code: null }
  }
  return {
    message:
      'Zahtev nije stigao do backend-a. Proveri da li je Convex deployment dostupan.',
    code: null,
  }
}

function requestPanel(state: RequestState): StatePanelProps | null {
  switch (state.kind) {
    case 'idle':
      return null
    case 'running':
      return {
        tone: 'progress',
        label: 'Učitavanje',
        title: 'Zahtev za pregled je poslat',
        message: `Backend proverava modul „${state.moduleName}“.`,
      }
    case 'accepted':
      return {
        tone: 'warning',
        label: 'Delimično',
        title: `Zahtev prihvaćen: ${state.moduleName}`,
        message: state.message,
      }
    case 'rejected':
      return {
        tone: 'error',
        label: 'Greška',
        title: 'Backend je odbio zahtev',
        message: state.message,
        code: state.code,
      }
  }
}

export function ModulesPage({ projectId, revisionId, onReviewAccepted }: ModulesPageProps) {
  const modules = useQuery(api.domainPacks.listModules)
  const requestReviewRun = useMutation(api.domainPacks.requestReviewRun)
  const [request, setRequest] = useState<RequestState>({ kind: 'idle' })

  async function startReview(moduleId: string) {
    const entry = modules?.find((m) => m.domain_pack_id === moduleId)
    const moduleName = entry?.name ?? moduleId
    setRequest({ kind: 'running', moduleId, moduleName })
    try {
      const result = await requestReviewRun({
        project_id: projectId,
        revision_id: revisionId ?? '',
        domain_pack_id: moduleId,
      })
      setRequest({ kind: 'accepted', moduleName, message: result.message })
      onReviewAccepted({
        domain_pack_id: result.domain_pack_id,
        name: moduleName,
        pack_version: result.pack_version,
      })
    } catch (error) {
      setRequest({ kind: 'rejected', ...describeError(error) })
    }
  }

  if (modules === undefined) {
    return (
      <div className="px-4 py-9 sm:px-10">
        <StatePanel
          tone="progress"
          label="Učitavanje"
          title="Katalog modula se učitava"
          message="Čeka se odgovor Convex deployment-a."
        />
      </div>
    )
  }

  if (modules.length === 0) {
    return (
      <div className="px-4 py-9 sm:px-10">
        <StatePanel
          tone="neutral"
          label="Prazno"
          title="Nema stručnih modula"
          message="Server nije prijavio nijedan modul, pa nema šta da se pokrene."
        />
      </div>
    )
  }

  const panel = requestPanel(request)

  return (
    <>
      <ModuleCatalog
        title={CATALOG_TITLE}
        subtitle={CATALOG_SUBTITLE}
        items={modules.map(toCatalogItem)}
        onStart={(moduleId) => {
          void startReview(moduleId)
        }}
        pendingId={request.kind === 'running' ? request.moduleId : null}
      />
      {panel ? (
        <section aria-label="Stanje pregleda" className="px-4 pb-12 sm:px-10">
          <div className="max-w-[520px]">
            <StatePanel {...panel} />
          </div>
        </section>
      ) : null}
    </>
  )
}
