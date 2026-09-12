/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as approval from "../approval.js";
import type * as changeSetPolicy from "../changeSetPolicy.js";
import type * as changeSets from "../changeSets.js";
import type * as documents from "../documents.js";
import type * as domainPackRegistry from "../domainPackRegistry.js";
import type * as domainPacks from "../domainPacks.js";
import type * as dossiers from "../dossiers.js";
import type * as filePolicy from "../filePolicy.js";
import type * as lib_providers_xai from "../lib/providers/xai.js";
import type * as lib_verify from "../lib/verify.js";
import type * as projects from "../projects.js";
import type * as questions from "../questions.js";
import type * as revisions from "../revisions.js";
import type * as workflows_extract from "../workflows/extract.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  approval: typeof approval;
  changeSetPolicy: typeof changeSetPolicy;
  changeSets: typeof changeSets;
  documents: typeof documents;
  domainPackRegistry: typeof domainPackRegistry;
  domainPacks: typeof domainPacks;
  dossiers: typeof dossiers;
  filePolicy: typeof filePolicy;
  "lib/providers/xai": typeof lib_providers_xai;
  "lib/verify": typeof lib_verify;
  projects: typeof projects;
  questions: typeof questions;
  revisions: typeof revisions;
  "workflows/extract": typeof workflows_extract;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
};
