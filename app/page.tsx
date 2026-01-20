"use client";

import React, { useEffect, useState } from "react";
import { createClient, type Entry } from "contentful";
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode,
} from "@contentful/live-preview/react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";

type PreviewDemoPageFields = {
  title?: string;
  slug?: string;
  description?: Document;
};

type PreviewDemoPageEntry = Entry<PreviewDemoPageFields>;

const CONTENT_TYPE = "previewDemoPage";
const SLUG = "live-preview-demo";

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
  environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT!,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_TOKEN!,
  host: "preview.contentful.com", // Preview API for draft + live preview
});

export default function Page() {
  return (
    <ContentfulLivePreviewProvider
      locale={process.env.NEXT_PUBLIC_CONTENTFUL_LOCALE ?? "en-US"}
      enableLiveUpdates
      enableInspectorMode
      targetOrigin={
        process.env.NEXT_PUBLIC_CONTENTFUL_TARGET_ORIGIN ??
        "https://app.contentful.com"
      }
    >
      <PreviewDemo />
    </ContentfulLivePreviewProvider>
  );
}

function PreviewDemo() {
  const [entry, setEntry] = useState<PreviewDemoPageEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Fetch once (initial data)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setError(null);
        const res = await client.getEntries<PreviewDemoPageFields>({
          content_type: CONTENT_TYPE,
          "fields.slug": SLUG,
          limit: 1,
        });
console.log('res ', res);

        const item = (res.items?.[0] ?? null) as PreviewDemoPageEntry | null;
        if (!cancelled) setEntry(item);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live Preview: updates the entry in-place when editing in Contentful
  const liveEntry = useContentfulLiveUpdates(entry);
console.log('Rendering PreviewDemo', liveEntry);

  // Inspector mode: lets Contentful highlight fields
  const inspector = useContentfulInspectorMode({
    entryId: liveEntry?.sys.id,
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
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Live Preview Demo</h1>

      <h2 {...inspector({ fieldId: "title" })}>
        {liveEntry.fields.title ?? "(No title)"}
      </h2>

      <div {...inspector({ fieldId: "description" })} style={{ lineHeight: 1.6 }}>
        {liveEntry.fields.description
          ? documentToReactComponents(liveEntry.fields.description)
          : "(No description)"}
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: "#666" }}>
        Content type: <code>{CONTENT_TYPE}</code> • slug: <code>{SLUG}</code>
      </p>
    </main>
  );
}
