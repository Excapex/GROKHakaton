import { Icon, type IconName } from "./Icon.tsx";
export type StatePanelTone = "neutral" | "progress" | "error" | "warning";
export type StatePanelProps = {
  tone: StatePanelTone;
  label: string;
  title: string;
  message: string;
  code?: string | null;
  action?: { label: string; onClick: () => void };
};
const icons: Record<StatePanelTone, IconName> = {
  neutral: "circle-dashed",
  progress: "refresh",
  error: "alert-circle",
  warning: "info-circle",
};

export function StatePanel({
  tone,
  label,
  title,
  message,
  code,
  action,
}: StatePanelProps) {
  return (
    <div
      className={`state-panel state-${tone}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <span className="state-icon">
        <Icon
          name={icons[tone]}
          size={23}
          className={tone === "progress" ? "is-spinning" : ""}
        />
      </span>
      <div className="state-body">
        <span className="state-label">{label}</span>
        <h3>{title}</h3>
        <p>{message}</p>
        {tone === "progress" && (
          <div className="loading-lines" aria-hidden="true">
            <span />
            <span />
          </div>
        )}
        {code && (
          <details className="technical-detail">
            <summary>Tehnički detalji</summary>
            <code>{code}</code>
          </details>
        )}
        {action && (
          <button
            type="button"
            className="button button-secondary"
            onClick={action.onClick}
          >
            {action.label}
            <Icon name="arrow-right" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
