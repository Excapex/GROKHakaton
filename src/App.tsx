import { useEffect, useState, type ReactNode } from "react";
import type { Id } from "../convex/_generated/dataModel";
import { AppShell } from "./components/generated/AppShell.tsx";
import { StatePanel } from "./components/generated/StatePanel.tsx";
import {
  DEMO_PROJECT_CODE,
  revisionLabel,
  toContractProject,
} from "./features/documents/projectMap.ts";
import { useWorkspace } from "./features/documents/useDemoWorkspace.ts";
import { ProjectSwitcher } from "./features/shell/ProjectSwitcher.tsx";
import { ModulesPage } from "./features/modules/ModulesPage.tsx";
import { ModulesUnavailable } from "./features/modules/ModulesUnavailable.tsx";
import { PlannedScreen } from "./features/shell/PlannedScreen.tsx";
import {
  DEMO_ACTIVE_REVISION_LABEL,
  DEMO_PROJECT,
  DEMO_PROJECT_CODE as FIXTURE_CODE,
  FIXTURE_LABEL,
} from "./features/shell/demoProject.ts";
import {
  NAV_ITEMS,
  type NavId,
  isNavId,
  resolveNavId,
} from "./features/shell/navigation.ts";
import { ProjectPage } from "./features/project/ProjectPage.tsx";
import {
  FIELDS_SEPARATION_NOTE,
  buildProjectFacts,
  type SelectedReviewModule,
} from "./features/shell/projectFacts.ts";

export type AppProps = {
  backendConfigured: boolean;
};

function useHashNavigation() {
  const [activeNavId, setActiveNavId] = useState<NavId>(() => {
    const hash = window.location.hash.slice(1);
    return resolveNavId(hash);
  });

  useEffect(() => {
    const syncNavigation = () => {
      const hash = window.location.hash.slice(1);
      setActiveNavId(resolveNavId(hash));
    };
    window.addEventListener("hashchange", syncNavigation);
    return () => window.removeEventListener("hashchange", syncNavigation);
  }, []);

  function navigate(navId: NavId) {
    setActiveNavId(navId);
    window.location.hash = navId;
  }

  return { activeNavId, navigate };
}

function ShellFrame({
  children,
  activeNavId,
  navigate,
  projectTitle,
  projectCode,
  facts,
  fixtureLabel,
  projectSwitcher,
}: {
  children: ReactNode;
  activeNavId: NavId;
  navigate: (navId: NavId) => void;
  projectTitle: string;
  projectCode: string;
  facts: ReturnType<typeof buildProjectFacts>;
  fixtureLabel?: string;
  projectSwitcher?: ReactNode;
}) {
  return (
    <AppShell
      appName="ProjectLens"
      tagline="Kopilot za tehničke projekte"
      navItems={NAV_ITEMS}
      activeNavId={activeNavId}
      onNavigate={(navId) => {
        if (isNavId(navId)) navigate(navId);
      }}
      projectTitle={projectTitle}
      projectCode={projectCode}
      facts={facts}
      factsNote={FIELDS_SEPARATION_NOTE}
      fixtureLabel={fixtureLabel}
      projectSwitcher={projectSwitcher}
      account={{ initials: "MJ", name: "M. Jovanović" }}
    >
      {children}
    </AppShell>
  );
}

function LiveApp({
  activeNavId,
  navigate,
}: {
  activeNavId: NavId;
  navigate: (navId: NavId) => void;
}) {
  const { projects, workspace, selectedId, select } = useWorkspace();
  // Pokrenut pregled pripada predmetu nad kojim je pokrenut i ne nasleđuje se.
  const [review, setReview] = useState<{
    projectId: string;
    module: SelectedReviewModule;
  } | null>(null);

  const activeProjectId = workspace?.project._id ?? null;
  const selectedModule =
    review && review.projectId === activeProjectId ? review.module : null;

  const switcher = projects.length > 0 && (
    <ProjectSwitcher
      projects={projects}
      selectedId={selectedId ?? workspace?.project._id ?? null}
      onSelect={select}
    />
  );

  if (!workspace) {
    return (
      <ShellFrame
        activeNavId={activeNavId}
        navigate={navigate}
        projectTitle="Učitavanje predmeta"
        projectCode={DEMO_PROJECT_CODE}
        facts={buildProjectFacts(DEMO_PROJECT, null, selectedModule)}
        projectSwitcher={switcher || undefined}
      >
        <div className="state-wrap">
          <StatePanel
            tone="progress"
            label="Učitavanje"
            title="Povezivanje sa Convex skladištem"
            message="Predmet, dokumenti i lanac revizija stižu sa servera. Ništa se ne izmišlja lokalno."
          />
        </div>
      </ShellFrame>
    );
  }

  const mapped = {
    project: toContractProject(workspace.project),
    revisionText: (() => {
      const active = workspace.revisions.find(
        (row) => row._id === workspace.project.activeRevisionId,
      );
      return active ? revisionLabel(active.index) : null;
    })(),
    activeDocuments: workspace.documents.filter(
      (doc) => doc.revisionId === workspace.project.activeRevisionId,
    ),
  };

  const facts = buildProjectFacts(
    mapped.project,
    mapped.revisionText,
    selectedModule,
  );

  return (
    <ShellFrame
      activeNavId={activeNavId}
      navigate={navigate}
      projectTitle={mapped.project.name}
      projectCode={DEMO_PROJECT_CODE}
      facts={facts}
      fixtureLabel="predmet iz Convex-a"
      projectSwitcher={switcher || undefined}
    >
      {activeNavId === "moduli" ? (
        <ModulesPage
          projectId={mapped.project.id}
          revisionId={mapped.project.active_revision_id}
          onReviewAccepted={(module) =>
            setReview(
              activeProjectId ? { projectId: activeProjectId, module } : null,
            )
          }
        />
      ) : (
        <ProjectPage
          projectId={workspace.project._id as Id<"projects">}
          revisionId={workspace.project.activeRevisionId}
          revisions={workspace.revisions}
          documents={mapped.activeDocuments}
          allDocuments={workspace.documents}
          events={workspace.events}
          onReviewAccepted={(module) =>
            setReview(
              activeProjectId ? { projectId: activeProjectId, module } : null,
            )
          }
        />
      )}
    </ShellFrame>
  );
}

export default function App({ backendConfigured }: AppProps) {
  const { activeNavId, navigate } = useHashNavigation();

  if (backendConfigured) {
    return <LiveApp activeNavId={activeNavId} navigate={navigate} />;
  }

  const project = DEMO_PROJECT;
  const facts = buildProjectFacts(project, DEMO_ACTIVE_REVISION_LABEL, null);

  return (
    <ShellFrame
      activeNavId={activeNavId}
      navigate={navigate}
      projectTitle={project.name}
      projectCode={FIXTURE_CODE}
      facts={facts}
      fixtureLabel={FIXTURE_LABEL}
    >
      {activeNavId === "moduli" ? (
        <ModulesUnavailable />
      ) : (
        <PlannedScreen navId={activeNavId} onNavigate={navigate} />
      )}
    </ShellFrame>
  );
}
