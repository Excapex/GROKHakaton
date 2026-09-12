export type IconName =
  | "layout-dashboard"
  | "files"
  | "list-check"
  | "history"
  | "stack-2"
  | "arrow-up-right"
  | "arrow-right"
  | "chevron-right"
  | "chevrons-left"
  | "chevrons-right"
  | "chevron-down"
  | "search"
  | "x"
  | "menu-2"
  | "help-circle"
  | "building"
  | "flame"
  | "lock"
  | "circle-check"
  | "info-circle"
  | "alert-circle"
  | "refresh"
  | "file-text"
  | "arrow-left"
  | "circle-dashed"
  | "shield-check";

/** Official Tabler Icons, self-hosted with the MIT license in public/icons. */
export function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`icon ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: `url(/icons/${name}.svg)`,
        WebkitMaskImage: `url(/icons/${name}.svg)`,
      }}
    />
  );
}
