import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon.tsx";

export type NavItem = { id: string; label: string };
export type ProjectFact = {
  id: string;
  label: string;
  value: string;
  code?: string;
  note?: string;
};
export type AppShellProps = {
  appName: string;
  tagline: string;
  navItems: readonly NavItem[];
  activeNavId: string;
  onNavigate: (navId: string) => void;
  projectTitle: string | null;
  projectCode?: string | null;
  facts?: readonly ProjectFact[];
  factsNote?: string;
  fixtureLabel?: string;
  account?: { initials: string; name: string };
  children: ReactNode;
};
const navIcons: Record<string, IconName> = {
  pregled: "layout-dashboard",
  dokumenti: "files",
  zadaci: "list-check",
  revizije: "history",
  moduli: "stack-2",
};

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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const activeLabel = navItems.find((item) => item.id === activeNavId)?.label;
  function navigate(id: string) {
    onNavigate(id);
    setMobileOpen(false);
  }

  return (
    <div className={`app-shell ${collapsed ? "rail-collapsed" : ""}`}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Pređi na sadržaj
      </a>
      <aside
        className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}
        aria-label="Radni prostor"
        onKeyDown={(event) => {
          if (event.key === "Escape") setMobileOpen(false);
        }}
      >
        <div className="brand-row">
          <a
            className="brand"
            href="#moduli"
            onClick={() => navigate("moduli")}
            aria-label={appName}
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="rail-label">
              {appName}
              <span className="brand-period">.</span>
            </span>
          </a>
          <button
            className="icon-button mobile-toggle"
            type="button"
            aria-label={mobileOpen ? "Zatvori navigaciju" : "Otvori navigaciju"}
            aria-expanded={mobileOpen}
            aria-controls="project-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Icon name={mobileOpen ? "x" : "menu-2"} />
          </button>
        </div>
        <div className="sidebar-content" id="project-navigation">
          <div className="workspace-identity">
            <span className="workspace-avatar">
              <Icon name="building" size={19} />
            </span>
            <span className="rail-label">
              <strong>Projektni prostor</strong>
              <small>{tagline}</small>
            </span>
          </div>
          <div className="project-switch">
            <span className="rail-label">Trenutni projekat</span>
            <button
              type="button"
              title={projectTitle ?? "Pregled projekta"}
              onClick={() => navigate("pregled")}
            >
              <Icon name="building" size={18} />
              <span className="rail-label">{projectTitle ?? "Projekat"}</span>
              <Icon name="chevron-right" size={15} />
            </button>
          </div>
          <nav aria-label="Glavna navigacija">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-label={item.label}
                    aria-current={item.id === activeNavId ? "page" : undefined}
                    onClick={() => navigate(item.id)}
                    title={item.label}
                  >
                    <Icon name={navIcons[item.id] ?? "stack-2"} />
                    <span className="rail-label">{item.label}</span>
                    {item.id === activeNavId && (
                      <span
                        className="nav-active-marker rail-label"
                        aria-hidden="true"
                      >
                        <Icon name="arrow-up-right" size={17} />
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-note rail-label">
              <Icon name="shield-check" size={21} />
              <p>
                Od dokumenta
                <br />
                <strong>do jasne odluke.</strong>
              </p>
              <span>Svaki nalaz počinje dokazom.</span>
            </div>
            <button
              className="sidebar-help"
              type="button"
              aria-label="Kako radi Saglasnik"
              onClick={() => setHelpOpen(!helpOpen)}
              aria-expanded={helpOpen}
              aria-controls="workspace-help"
              title="Kako radi Saglasnik"
            >
              <Icon name="help-circle" />
              <span className="rail-label">Kako radi Saglasnik</span>
            </button>
            {account && (
              <div className="account-row">
                <span className="account-avatar">{account.initials}</span>
                <div className="rail-label">
                  <strong>{account.name}</strong>
                  <span>Demo radni prostor</span>
                </div>
                <button
                  className="icon-button collapse-toggle"
                  type="button"
                  onClick={() => setCollapsed(!collapsed)}
                  aria-label={
                    collapsed
                      ? "Proširi bočnu navigaciju"
                      : "Sažmi bočnu navigaciju"
                  }
                >
                  <Icon
                    name={collapsed ? "chevrons-right" : "chevrons-left"}
                    size={17}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Radni prostor</span>
            <Icon name="chevron-right" size={14} />
            <strong>{activeLabel}</strong>
          </div>
          <span className="demo-badge">
            <Icon name="circle-dashed" size={14} />
            {fixtureLabel ?? "Demo"}
          </span>
        </header>
        {helpOpen && (
          <section
            id="workspace-help"
            className="help-panel"
            aria-label="Kako radi Saglasnik"
          >
            <div>
              <h2>Od dokumentacije do proverene izmene</h2>
              <p>
                Dodajte dokumente, odaberite stručni modul i pregledajte nalaze
                sa dokazima. Projektantsku odluku prihvatate vi. Izmena se
                smatra rešenom tek nakon provere nove revizije.
              </p>
              <span>
                U ovoj verziji dostupan je izbor modula. Obrada dokumenata i
                provera izmena još se povezuju.
              </span>
            </div>
            <button
              className="icon-button"
              onClick={() => setHelpOpen(false)}
              aria-label="Zatvori pomoć"
            >
              <Icon name="x" />
            </button>
          </section>
        )}
        {projectTitle && (
          <section className="project-bar" aria-label="Zaglavlje predmeta">
            <div className="project-heading">
              <span className="project-symbol">
                <Icon name="building" size={22} />
              </span>
              <div>
                <h1>{projectTitle}</h1>
                <span className="project-code">{projectCode}</span>
              </div>
            </div>
            <dl className="project-facts">
              {facts.map((fact) => (
                <div
                  key={fact.id}
                  className={fact.id === "domain_pack" ? "review-fact" : ""}
                >
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            {factsNote && (
              <details className="project-explainer">
                <summary aria-label="O disciplini projekta i postupku pregleda">
                  <Icon name="info-circle" size={17} />
                </summary>
                <p>{factsNote}</p>
              </details>
            )}
          </section>
        )}
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="workspace-footer">
          <span>
            {appName} <span aria-hidden="true">/</span> {tagline}
          </span>
          <span>Podrška projektantu. Odluka je vaša.</span>
        </footer>
      </div>
    </div>
  );
}
