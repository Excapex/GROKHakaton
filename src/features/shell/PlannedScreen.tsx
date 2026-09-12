import { Icon, type IconName } from "../../components/generated/Icon.tsx";
import type { NavId } from "./navigation.ts";

type Screen = {
  title: string;
  description: string;
  icon: IconName;
  emptyTitle: string;
  message: string;
  sections: { title: string; body: string }[];
};
const SCREENS: Record<string, Screen> = {
  projekat: {
    title: "Projekat",
    description:
      "Ubaci dokumentaciju, izaberi tip pregleda i pročitaj primedbe.",
    icon: "layout-dashboard",
    emptyTitle: "Dobra odluka počinje dokazom.",
    message:
      "Predmet, dokumenti i primedbe stižu kad je veza sa serverom podešena.",
    sections: [
      { title: "Dokumentacija", body: "Originali tekuće provere." },
      { title: "Primedbe", body: "Šta nije u redu, gde stoji i šta uraditi." },
      { title: "Provere", body: "Svaki novi set dokumenata je nova provera." },
    ],
  },
  pregled: {
    title: "Pregled projekta",
    description: "Dokumentacija, stručni nalazi i odluke na jednom mestu.",
    icon: "layout-dashboard",
    emptyTitle: "Dobra odluka počinje dokazom.",
    message:
      "Pregled će objediniti nalaze iz vaših dokumenata. Za sada možete istražiti stručne module i odabrati postupak pregleda.",
    sections: [
      { title: "Dokumentacija", body: "Povezane sveske i izvori projekta." },
      {
        title: "Nalazi sa dokazima",
        body: "Primedbe sa tačnom stranom i izvorom.",
      },
      {
        title: "Projektantske odluke",
        body: "Jasan trag od predloga do provere.",
      },
    ],
  },
  dokumenti: {
    title: "Dokumenti",
    description: "Izvorna dokumentacija i sve njene buduće revizije.",
    icon: "files",
    emptyTitle: "Mesto za svaku svesku projekta.",
    message:
      "Dodavanje i čuvanje dokumenata još nisu dostupni. Kada budu povezani, ovde ćete organizovati izvore za stručni pregled.",
    sections: [
      {
        title: "PDF dokumentacija",
        body: "Sveske, fizičke strane i čitljivi izvori.",
      },
      { title: "DOCX i XLSX", body: "Podržani izvori za predlaganje izmena." },
      {
        title: "CAD izvori",
        body: "Čuvanje originala; izmene kao projektantski zadaci.",
      },
    ],
  },
  zadaci: {
    title: "Zadaci",
    description: "Od otvorenog pitanja do proverene projektantske odluke.",
    icon: "list-check",
    emptyTitle: "Svaka primedba ima sledeći korak.",
    message:
      "Zadaci će se pojaviti kada pregled dokumentacije bude povezan. Ovde ćete odgovarati na pitanja i razmatrati predložene izmene.",
    sections: [
      {
        title: "Pitanja projektantu",
        body: "Razjasnite podatke koji nedostaju.",
      },
      {
        title: "Povezane izmene",
        body: "Razmotrite uticaj odluke na dokumente.",
      },
      {
        title: "Potvrda rešenja",
        body: "Prihvaćeno nije isto što i provereno.",
      },
    ],
  },
  revizije: {
    title: "Revizije",
    description: "Istorija dokumenata sa sačuvanim originalima.",
    icon: "history",
    emptyTitle: "Svaka izmena ostavlja jasan trag.",
    message:
      "Istorija i poređenje revizija još nisu dostupni. Prikazana revizija projekta je demo podatak, bez pridruženih izlaznih dokumenata.",
    sections: [
      {
        title: "Sačuvani originali",
        body: "Nova revizija ne prepisuje izvorni dokument.",
      },
      {
        title: "Poređenje izmena",
        body: "Pogledajte šta se promenilo između verzija.",
      },
      {
        title: "Ponovna provera",
        body: "Nova revizija se čita i proverava ponovo.",
      },
    ],
  },
};

export function PlannedScreen({
  navId,
  onNavigate,
}: {
  navId: string;
  onNavigate: (id: NavId) => void;
}) {
  const screen = SCREENS[navId] ?? SCREENS.pregled;
  return (
    <section className="page-content" aria-label={screen.title}>
      <div className="page-heading">
        <h2>{screen.title}</h2>
        <p>{screen.description}</p>
      </div>
      <div className="empty-workspace">
        <div className="empty-workspace-copy">
          <span className="empty-symbol">
            <Icon name={screen.icon} size={32} />
          </span>
          <span className="status-badge planned">U pripremi</span>
          <h3>{screen.emptyTitle}</h3>
          <p>{screen.message}</p>
          <button
            className="button button-primary"
            type="button"
            onClick={() => onNavigate("moduli")}
          >
            Istraži stručne module
            <Icon name="arrow-up-right" size={18} />
          </button>
        </div>
        <div className="empty-workspace-visual">
          <img
            src="/images/architectural-model.png"
            alt=""
            width="1024"
            height="768"
          />
          <span>Ilustrativni model</span>
        </div>
      </div>
      <div className="planned-capabilities" aria-label="Planirane mogućnosti">
        {screen.sections.map((section) => (
          <div key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
      {navId === "zadaci" && (
        <div className="lifecycle" aria-label="Planirani tok izmene">
          <p>
            Četiri odvojena stanja: predloženo, prihvaćeno, primenjeno, provereno.
            Prihvatanje nije provera.
          </p>
          <ol>
            {["Predloženo", "Prihvaćeno", "Primenjeno", "Provereno"].map(
              (label, index) => (
                <li key={label}>
                  {index > 0 && <Icon name="arrow-right" size={16} />}
                  <span>{label}</span>
                </li>
              ),
            )}
          </ol>
        </div>
      )}
      <p className="availability-note">
        <Icon name="info-circle" size={16} />
        Ovaj ekran prikazuje planirani tok. Još nema podataka iz obrade
        dokumenata.
      </p>
    </section>
  );
}
