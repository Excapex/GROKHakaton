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
import type * as lib_daytona_client from "../lib/daytona/client.js";
import type * as lib_daytona_ingestResult from "../lib/daytona/ingestResult.js";
import type * as lib_perception_anonFixture from "../lib/perception/anonFixture.js";
import type * as lib_perception_assemble from "../lib/perception/assemble.js";
import type * as lib_perception_changeset from "../lib/perception/changeset.js";
import type * as lib_perception_hashes from "../lib/perception/hashes.js";
import type * as lib_perception_judge from "../lib/perception/judge.js";
import type * as lib_perception_mappedRuleCopy from "../lib/perception/mappedRuleCopy.js";
import type * as lib_perception_pageTexts from "../lib/perception/pageTexts.js";
import type * as lib_perception_planFromDocuments from "../lib/perception/planFromDocuments.js";
import type * as lib_perception_rereadMeasure from "../lib/perception/rereadMeasure.js";
import type * as lib_perception_slots from "../lib/perception/slots.js";
import type * as lib_perception_types from "../lib/perception/types.js";
import type * as lib_providers_xai from "../lib/providers/xai.js";
import type * as lib_verify from "../lib/verify.js";
import type * as pageRoles from "../pageRoles.js";
import type * as pageTexts from "../pageTexts.js";
import type * as projects from "../projects.js";
import type * as questions from "../questions.js";
import type * as revisions from "../revisions.js";
import type * as workflows_apply from "../workflows/apply.js";
import type * as workflows_extract from "../workflows/extract.js";
import type * as workflows_ingest from "../workflows/ingest.js";
import type * as workflows_review from "../workflows/review.js";

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
  "lib/daytona/client": typeof lib_daytona_client;
  "lib/daytona/ingestResult": typeof lib_daytona_ingestResult;
  "lib/perception/anonFixture": typeof lib_perception_anonFixture;
  "lib/perception/assemble": typeof lib_perception_assemble;
  "lib/perception/changeset": typeof lib_perception_changeset;
  "lib/perception/hashes": typeof lib_perception_hashes;
  "lib/perception/judge": typeof lib_perception_judge;
  "lib/perception/mappedRuleCopy": typeof lib_perception_mappedRuleCopy;
  "lib/perception/pageTexts": typeof lib_perception_pageTexts;
  "lib/perception/planFromDocuments": typeof lib_perception_planFromDocuments;
  "lib/perception/rereadMeasure": typeof lib_perception_rereadMeasure;
  "lib/perception/slots": typeof lib_perception_slots;
  "lib/perception/types": typeof lib_perception_types;
  "lib/providers/xai": typeof lib_providers_xai;
  "lib/verify": typeof lib_verify;
  pageRoles: typeof pageRoles;
  pageTexts: typeof pageTexts;
  projects: typeof projects;
  questions: typeof questions;
  revisions: typeof revisions;
  "workflows/apply": typeof workflows_apply;
  "workflows/extract": typeof workflows_extract;
  "workflows/ingest": typeof workflows_ingest;
  "workflows/review": typeof workflows_review;
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
