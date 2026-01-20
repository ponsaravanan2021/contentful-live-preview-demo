"use client";

import React, { useEffect, useState } from "react";
import { ContentfulLivePreview } from "@contentful/live-preview";
import gql from "graphql-tag";
import type { DocumentNode } from "graphql";
import { print } from "graphql";

import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode,
} from "@contentful/live-preview/react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";

const CONTENT_TYPE = "previewDemoPage";
const SLUG = "live-preview-demo";

/**
 * GraphQL query:
 * - Uses Preview API via `preview: true`
 * - Includes `__typename` + `sys { id }` for Live Preview updates
 */
const query: DocumentNode = gql`
  query PreviewDemoPageBySlug($slug: String!, $locale: String!) {
    previewDemoPageCollection(where: { slug: $slug }, limit: 1, locale: $locale, preview: true) {
      items {
        __typename
        sys { id }
        title
        slug
        description { json }

        sectionsCollection(limit: 20) {
          items {
            __typename
            sys { id }
            ... on ContentBlock {
              headline
              body { json }
            }
          }
        }
      }
    }
  }
`;

type ContentBlockGql = {
  __typename?: "ContentBlock";
  sys: { id: string };
  headline?: string | null;
  body?: { json: Document } | null;
};

type PreviewDemoPageGql = {
  __typename?: string;
  sys: { id: string };
  title?: string | null;
  slug?: string | null;
  description?: { json: Document } | null;
  sectionsCollection?: {
    items: Array<ContentBlockGql | null>;
  } | null;
};


type PreviewDemoQueryData = {
  previewDemoPageCollection?: {
    items: Array<PreviewDemoPageGql | null>;
  } | null;
};

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
  extensions?: unknown;
};

async function fetchGraphQLRaw<TData>(
  query: string | DocumentNode,
  variables: Record<string, any>
) {
  const endpoint = process.env.NEXT_PUBLIC_CONTENTFUL_GRAPHQL_ENDPOINT!;
  const token = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_TOKEN!;

  const queryString = typeof query === "string" ? query : print(query);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: queryString, variables }),
  });

  const json = await res.json();

  if (!res.ok || json.errors?.length) {
    console.error("GraphQL error:", json);
    throw new Error(json.errors?.[0]?.message ?? `GraphQL failed (${res.status})`);
  }

  return json;
}


export default function Page() {

  return (
    <ContentfulLivePreviewProvider
      locale={process.env.NEXT_PUBLIC_CONTENTFUL_LOCALE ?? "en-US"}
      enableLiveUpdates
      enableInspectorMode
      targetOrigin={
        process.env.NEXT_PUBLIC_CONTENTFUL_TARGET_ORIGIN ?? "https://app.contentful.com"
      }
    >
      <PreviewDemo />
    </ContentfulLivePreviewProvider>
  );
}

function PreviewDemo() {

  const [raw, setRaw] = useState<GraphQLResponse<PreviewDemoQueryData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setError(null);

        const json = await fetchGraphQLRaw<PreviewDemoQueryData>(query, {
          slug: SLUG,
          locale: process.env.NEXT_PUBLIC_CONTENTFUL_LOCALE ?? "en-US",
        });
        console.log("refreshing", json);
        if (!cancelled) setRaw(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const liveRaw = useContentfulLiveUpdates(raw, { query });

  // Extract the entry for rendering
  const liveEntry = liveRaw?.data?.previewDemoPageCollection?.items?.[0] ?? null;

  console.log("Rendering PreviewDemo", liveEntry);

  const inspector = useContentfulInspectorMode({
    entryId: liveEntry?.sys?.id,
  });

  if (error) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <h1>Live Preview Demo</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
      </main>
    );
  }

  if (!liveEntry) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <h1>Live Preview Demo</h1>
        <p>Loading…</p>
        <p style={{ fontSize: 13, color: "#666" }}>
          Content type: <code>{CONTENT_TYPE}</code> • slug: <code>{SLUG}</code>
        </p>
      </main>
    );
  }
  const sections = liveEntry.sectionsCollection?.items?.filter(Boolean) as ContentBlockGql[];

  return (

    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Live Preview Demo</h1>

      <h2 {...inspector({ fieldId: "title" })}>
        {liveEntry.title ?? "(No title)"}
      </h2>

      <div
        {...inspector({ fieldId: "description" })}
        style={{ lineHeight: 1.6 }}
      >
        {liveEntry.description?.json
          ? documentToReactComponents(liveEntry.description.json)
          : "(No description)"}
      </div>

      <h3 style={{ marginTop: 24 }}>Sections</h3>

      {sections.length === 0 ? (
        <p>(No sections)</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sections.map((s, idx) => (
            <section
              key={s.sys.id}
              style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}
              {...inspector({
                // highlight the reference field "sections" on the page entry
                fieldId: "sections",
                // and point to the linked entry when clicking
                entryId: s.sys.id,
              })}
            >
              <div style={{ fontSize: 12, color: "#666" }}>Section {idx + 1}</div>

              <h4 style={{ margin: "6px 0" }}>{s.headline ?? "(No section title)"}</h4>

              <div style={{ lineHeight: 1.6 }}>
                {s.body?.json ? documentToReactComponents(s.body.json) : "(No body)"}
              </div>
            </section>
          ))}
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 13, color: "#666" }}>
        Content type: <code>{CONTENT_TYPE}</code> • slug: <code>{SLUG}</code>
      </p>
    </main>
  );
}
