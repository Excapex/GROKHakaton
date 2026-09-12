import { useEffect, useState } from "react";
import { AppShell } from "./components/generated/AppShell.tsx";
import { ModulesPage } from "./features/modules/ModulesPage.tsx";
import { ModulesUnavailable } from "./features/modules/ModulesUnavailable.tsx";
import { PlannedScreen } from "./features/shell/PlannedScreen.tsx";
import {
  DEMO_ACTIVE_REVISION_LABEL,
  DEMO_PROJECT,
  DEMO_PROJECT_CODE,
  FIXTURE_LABEL,
} from "./features/shell/demoProject.ts";
import {
  DEFAULT_NAV_ID,
  NAV_ITEMS,
  type NavId,
  isNavId,
} from "./features/shell/navigation.ts";
import {
  FIELDS_SEPARATION_NOTE,
  buildProjectFacts,
  type SelectedReviewModule,
} from "./features/shell/projectFacts.ts";

export type AppProps = {
  /** Da li postoji Convex deployment; bez njega nema serverskog kataloga. */
  backendConfigured: boolean;
};

export default function App({ backendConfigured }: AppProps) {
  const [activeNavId, setActiveNavId] = useState<NavId>(() => {
    const hash = window.location.hash.slice(1);
    return isNavId(hash) ? hash : DEFAULT_NAV_ID;
  });
  const [selectedModule, setSelectedModule] =
    useState<SelectedReviewModule | null>(null);

  useEffect(() => {
    const syncNavigation = () => {
      const hash = window.location.hash.slice(1);
      setActiveNavId(isNavId(hash) ? hash : DEFAULT_NAV_ID);
    };
    window.addEventListener("hashchange", syncNavigation);
    return () => window.removeEventListener("hashchange", syncNavigation);
  }, []);

  function navigate(navId: NavId) {
    setActiveNavId(navId);
    window.location.hash = navId;
  }

  const project = DEMO_PROJECT;
  const facts = buildProjectFacts(
    project,
    DEMO_ACTIVE_REVISION_LABEL,
    selectedModule,
  );

  return (
    <AppShell
      appName="Saglasnik"
      tagline="Kopilot za tehničke projekte"
      navItems={NAV_ITEMS}
      activeNavId={activeNavId}
      onNavigate={(navId) => {
        if (isNavId(navId)) navigate(navId);
      }}
      projectTitle={project.name}
      projectCode={DEMO_PROJECT_CODE}
      facts={facts}
      factsNote={FIELDS_SEPARATION_NOTE}
      fixtureLabel={FIXTURE_LABEL}
      account={{ initials: "MJ", name: "M. Jovanović" }}
    >
      {activeNavId === "moduli" ? (
        backendConfigured ? (
          <ModulesPage
            projectId={project.id}
            revisionId={project.active_revision_id}
            onReviewAccepted={setSelectedModule}
          />
        ) : (
          <ModulesUnavailable />
        )
      ) : (
        <PlannedScreen navId={activeNavId} onNavigate={navigate} />
      )}
    </AppShell>
  );
}
