import { useId, useState, type ReactNode } from "react";
import { Icon } from "./Icon.tsx";

export type ModuleAvailability = "active" | "planned";
export type ModuleCatalogItem = {
  id: string;
  name: string;
  availability: ModuleAvailability;
  version?: string | null;
  scope: string;
  hint?: string;
};
export type ModuleCatalogProps = {
  title: string;
  subtitle: string;
  items: readonly ModuleCatalogItem[];
  onStart: (moduleId: string) => void;
  pendingId?: string | null;
  feedback?: ReactNode;
};
type Filter = "all" | ModuleAvailability;

export function ModuleCatalog({
  title,
  subtitle,
  items,
  onStart,
  pendingId,
  feedback,
}: ModuleCatalogProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const searchId = useId();
  const normalized = query.trim().toLocaleLowerCase("sr");
  const visible = items.filter(
    (item) =>
      (filter === "all" || item.availability === filter) &&
      item.name.toLocaleLowerCase("sr").includes(normalized),
  );
  const active = visible.filter((item) => item.availability === "active");
  const planned = visible.filter((item) => item.availability === "planned");
  const counts = {
    all: items.length,
    active: items.filter((item) => item.availability === "active").length,
    planned: items.filter((item) => item.availability === "planned").length,
  };
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Svi moduli" },
    { id: "active", label: "Aktivni" },
    { id: "planned", label: "Planirani" },
  ];

  return (
    <section className="page-content" aria-label={title}>
      <div className="page-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="catalog-toolbar">
        <div
          className="filter-group"
          role="group"
          aria-label="Dostupnost modula"
        >
          {filters.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
              <span>{counts[option.id]}</span>
            </button>
          ))}
        </div>
        <div className="search-field">
          <Icon name="search" size={17} />
          <label htmlFor={searchId} className="sr-only">
            Pretraži module
          </label>
          <input
            id={searchId}
            type="search"
            placeholder="Pretraži module…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              className="icon-button"
              type="button"
              aria-label="Obriši pretragu"
              onClick={() => setQuery("")}
            >
              <Icon name="x" size={15} />
            </button>
          )}
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "modul" : "modula"} u prikazu
      </div>
      <div className="catalog-content">
        {feedback && <div className="catalog-feedback">{feedback}</div>}
        {active.map((item) => (
          <article className="featured-module" key={item.id}>
            <div className="featured-copy">
              <div className="module-status-line">
                <span className="status-badge available">
                  <span />
                  Aktivno
                </span>
                {item.version && (
                  <span className="version-label">Izdanje {item.version}</span>
                )}
              </div>
              <h3>{item.name}</h3>
              <p className="module-scope">{item.scope}</p>
              <div className="featured-action">
                <button
                  className="button button-primary"
                  type="button"
                  disabled={Boolean(pendingId)}
                  onClick={() => onStart(item.id)}
                >
                  {pendingId === item.id
                    ? "Slanje zahteva…"
                    : "Pokreni pregled"}
                  <Icon
                    name={pendingId === item.id ? "refresh" : "arrow-up-right"}
                    size={18}
                    className={pendingId === item.id ? "is-spinning" : ""}
                  />
                </button>
                {item.hint && (
                  <span className="evidence-note">
                    <Icon name="file-text" size={16} />
                    {item.hint}
                  </span>
                )}
              </div>
            </div>
            <div className="featured-visual">
              <img
                src="/images/architectural-model.png"
                alt=""
                width="1024"
                height="768"
                fetchPriority="high"
              />
              <span className="concept-caption">Ilustrativni model</span>
            </div>
          </article>
        ))}
        <div className="catalog-lower">
          <div className="planned-section">
            {planned.length > 0 && (
              <>
                <div className="section-heading">
                  <h3>Discipline koje dolaze</h3>
                  <span>
                    {planned.length} {planned.length === 1 ? "modul" : "modula"}
                  </span>
                </div>
                <ul className="planned-modules">
                  {planned.map((item) => (
                    <li key={item.id}>
                      <details className="planned-module">
                        <summary>
                          <span className="module-symbol">
                            <Icon name="building" size={20} />
                          </span>
                          <span className="planned-name">{item.name}</span>
                          <span className="status-badge planned">
                            Planirano
                          </span>
                          <Icon name="chevron-down" size={16} />
                        </summary>
                        <div className="planned-detail">
                          <p>{item.scope}</p>
                          <button type="button" disabled>
                            <Icon name="lock" size={14} />
                            Pokretanje nije dostupno
                          </button>
                          <small>Ovaj modul još ne proizvodi rezultate.</small>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
                <p className="planned-footnote">
                  <Icon name="info-circle" size={15} />
                  Planirani moduli biće dostupni u narednim izdanjima.
                </p>
              </>
            )}
            {visible.length === 0 && (
              <div className="search-empty">
                <Icon name="search" size={28} />
                <h3>Nema modula za ovu pretragu</h3>
                <p>Promenite pojam ili prikažite sve module.</p>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Prikaži sve module
                  <Icon name="arrow-right" size={16} />
                </button>
              </div>
            )}
          </div>
          <aside className="review-guide" aria-label="O stručnom pregledu">
            <Icon name="shield-check" size={27} />
            <h3>
              Stručni pregled. <br />
              Proverljiv trag.
            </h3>
            <p>
              Modul određuje šta se proverava. Svaki nalaz mora da vodi do
              izvora u vašoj dokumentaciji.
            </p>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <strong>Odaberite modul</strong>
                  <p>Postupak koji odgovara projektu.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Pregledajte dokaze</strong>
                  <p>Nalaz, izvor i tačna strana.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Donesite odluku</strong>
                  <p>Prihvatanje prethodi proveri izmene.</p>
                </div>
              </li>
            </ol>
            <div className="guide-note">
              Izbor modula je dostupan. Obrada i nalazi još se povezuju.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
