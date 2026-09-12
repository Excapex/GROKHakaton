---
name: "ProjectLens"
description: "An architectural working folio for technical project review."
colors:
  surface: "#f7f9f7"
  paper: "#fff"
  ink: "#202e2a"
  muted: "#64716b"
  line: "#dde4de"
  rail: "#182b29"
  rail-muted: "#aabdb5"
  accent: "#23634c"
  accent-hover: "#174c39"
  mint: "#e8f1eb"
  nav-active: "#c9dfce"
  nav-active-ink: "#193d2b"
  available: "#cfe2d4"
  available-ink: "#235b3e"
  planned: "#edf0eb"
  planned-ink: "#5e695f"
  feature-surface: "#e7efea"
  guide-surface: "#eef2ec"
  warning-surface: "#fcf8ee"
  warning-line: "#e7dac0"
  warning-ink: "#8c641f"
  error-surface: "#fff4f1"
  error-line: "#ebd0c5"
  error-ink: "#a14a32"
typography:
  headline:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-.04em"
  feature-title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "29px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-.04em"
  title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: "-.02em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  control:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.55
  status:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  panel: "14px"
  control: "8px"
  field: "7px"
  status: "5px"
  state: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section: "32px"
  gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-icon:
    rounded: "{rounded.field}"
    size: "36px"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    rounded: "{rounded.field}"
    padding: "0 11px"
    height: "35px"
    width: "224px"
  nav-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.nav-active-ink}"
    rounded: "{rounded.control}"
    padding: "10px 13px"
  status-available:
    backgroundColor: "{colors.available}"
    textColor: "{colors.available-ink}"
    typography: "{typography.status}"
    rounded: "{rounded.status}"
    padding: "4px 8px"
  status-planned:
    backgroundColor: "{colors.planned}"
    textColor: "{colors.planned-ink}"
    typography: "{typography.status}"
    rounded: "{rounded.status}"
    padding: "4px 8px"
  filter-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "7px 11px"
  state-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.state}"
    padding: "23px"
  review-guide:
    backgroundColor: "{colors.guide-surface}"
    rounded: "{rounded.panel}"
    padding: "23px 25px"
---

# Design System: ProjectLens

## Overview

**Creative North Star: "The architectural material-library folio"**

A calm working folio for Serbian architects and engineers: an ink-green project index beside a light, precise document surface. Soft green fields distinguish guidance and available actions; compact metadata and ruled lists keep the workspace practical.

The architectural model is decorative concept art. Text and explicit availability labels carry meaning; the illustration never stands in for project evidence.

**Key Characteristics:**

- Persistent project index with responsive navigation.
- Self-hosted Manrope and a consistent Tabler outline icon vocabulary.
- Light paper, restrained emerald actions, soft panels and compact ruled lists.

## Colors

### Primary

`accent` is the emerald action and focus color; `accent-hover` deepens it on hover. `mint` supports selected counts and secondary button hover. `available` and `available-ink` mark actual availability with a written label.

### Neutral

`rail` anchors navigation; `rail-muted` supports its secondary labels. `surface` is the porcelain workspace, `paper` the toolbar and white controls, `ink` the main text, `muted` supporting text, and `line` the structural divider. `nav-active` and `nav-active-ink` form the light selected navigation row. `feature-surface` and `guide-surface` provide quiet tonal panels.

Planned, warning and error color pairs belong to explicit state messaging. Their labels and icons remain necessary; color alone carries no status. The sidecar’s eight-step OKLCH ramps are synthesized preview metadata, not additional shipping color tokens.

## Typography

Manrope is self-hosted from `/fonts/manrope-400.ttf`, `/fonts/manrope-600.ttf` and `/fonts/manrope-700.ttf`, with `font-display: swap` and font synthesis disabled. All principal interface type uses the frontmatter stack. Technical code falls back to monospace.

The headline role is the page heading; feature-title is the available module heading; title is the compact section heading. Body establishes the inherited scale, with most working copy at 12–13px and supporting labels at 10–11px. Control and status roles are deliberately compact. Project names use 15px/700; the guide heading uses 20px/600. Headings balance wrapping, while paragraph measures vary by purpose (page introduction 75ch, planned scope 60ch). Filter counts use tabular numerals.

These are observed roles, not a mathematical type scale. Tiny illustration captions and footer metadata are ancillary treatments, not a recommended body-text size.

## Layout

The desktop shell is a two-column grid: a sticky 236px navigation rail, full viewport height, and a flexible workspace. Manual collapse gives the rail 76px. The breadcrumb toolbar is 72px high. Main content is centered with a 1360px maximum width and 35px 40px 40px padding; the project strip uses 24px 40px. Spacing tokens summarize recurring values, while individual layouts use additional measured offsets.

The catalog feature uses a 1.2fr/1fr text-and-image grid with a 270px minimum height. Below it, ruled discipline rows and the guide occupy `minmax(0,1.65fr) minmax(245px,1fr)`, separated by 32px. Empty workspaces use a 1.05fr/1fr copy-and-image panel.

- At 1600px and wider: page top padding becomes 45px; feature minimum height 310px and copy padding 35px.
- At 1250px and narrower: the default rail is 215px; horizontal workspace padding is 28px, and the project strip wraps. Feature titles become 25px and the lower grid narrows to `minmax(0,1.5fr) minmax(225px,1fr)`.
- From 769px through 1050px: navigation automatically uses the 76px icon rail.
- At 768px and narrower: the rail becomes a normal-flow header with a 64px brand row and expandable two-column navigation. Workspace gutters are 20px, the breadcrumb toolbar is 50px, search fills its row, and content panels stack. Page headings become 28px; feature headings are 28px. Feature art is 220px high and empty-state art 230px. Primary/secondary buttons have a 44px minimum height. The review fact occupies its own divided row below the three-column fact grid.
- Below 801px viewport height on desktop: the ancillary sidebar note hides and bottom spacing tightens.

## Elevation & Depth

Tonal backgrounds and thin dividers provide the normal separation. Cards and buttons have no resting shadow. Only the project-facts explainer uses a floating shadow (`0 8px 30px #182b291c`), a 10px corner and an absolute position below the project strip. Decorative model images use `mix-blend-mode: multiply` to sit naturally on the pale green panel.

## Shapes

Panels use the panel radius; ordinary buttons and navigation use the control radius; search and icon buttons use the field radius. Status badges use the smaller status radius. Feedback panels use the state radius and a 1px border. Circular step numbers and account avatars remain small orientation devices. The brand mark is three vertical bars skewed by −20 degrees.

## Components

**Buttons.** Primary and secondary actions use a 20px icon gap and a 40px desktop minimum height. Primary hover deepens the accent; pressing shifts it down 1px. Disabled primary buttons use `#6d8878` and a not-allowed cursor. Secondary buttons have a `#bdc9bf` border and mint hover. Icon buttons are 36px squares with a transparent resting background and a light hover surface.

**Search and filters.** Search is a bordered, labeled field with a search icon and conditional clear action. Its focus-within ring is 2px emerald with a 3px offset. Filter buttons expose `aria-pressed`, use a white bordered selected state, and keep availability counts based on the complete catalog while the visible list is filtered. Counts have compact rectangular backgrounds.

**Navigation.** Links use 13px/600, a 45px minimum height and a 12px icon gap. Hover uses a darker green row; the current page uses the light navigation pair and `aria-current`. Mobile navigation is an inline expansion, closes after navigation or Escape, and exposes its expanded state. A skip link moves keyboard focus to the main content.

**Status and feedback.** Available badges include a small dot; planned badges carry the explicit `Planirano` label. StatePanel supports neutral, progress, warning and error, combining an icon, label, heading, message, optional disclosure and secondary action. Error feedback uses an assertive alert; other states announce politely. Technical details remain in a native disclosure. The baseline panel is capped at 760px; catalog feedback may fill its container.

**Ruled disclosures and guide.** Planned modules use native details/summary rows, dividers and a rotating chevron; their unavailable action remains disabled. The guide is a flat tonal aside with outlined circular step numbers and a divided note.

**Imagery and icons.** `/images/architectural-model.png` is decorative generated art with the caption “Ilustrativni model.” Preserve its provenance alongside the asset. Official Tabler SVGs are self-hosted in `/icons/` and rendered as current-color CSS masks, normally 20px; surrounding controls provide accessible names. Sidecar previews inline the same SVG paths so they render without a framework.

**Motion and focus.** Buttons and navigation use `180ms cubic-bezier(.2,.7,.2,1)` transitions. Progress uses a 1.3s linear spinner and 1.4s alternating pulse. Reduced-motion preference disables animations and transitions. Standard focus is a 2px accent outline with a 4px offset; sidebar focus uses `#b6d5bf` for contrast.

## Do's and Don'ts

- Do reuse the CSS custom properties and the shipped Manrope weights.
- Do pair status colors with explicit Serbian labels and keep planned actions visibly disabled.
- Do retain keyboard focus, input labels, live feedback and reduced-motion behavior.
- Do identify the architectural illustration as an illustrative model and keep its image alt empty.
- Don't present the decorative model as a project drawing or evidence.
- Don't turn planned disciplines into apparently available review actions.
- Don't replace the ink-green index and light document surface with an unrelated visual identity.
