import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Atlas shell and headline findings", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Federal Criminal Common Law Atlas<\/title>/i);
  assert.match(html, /The Court renounced common-law crimes/);
  assert.match(html, />460</);
  assert.match(html, /Hudson genealogy/);
  assert.doesNotMatch(html, /Prompt sensitivity|correction process/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("ships the reconciled data and GitHub Pages build surface", async () => {
  const [page, layout, app, data, packageJson, nextConfig] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/atlas-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/atlas-data.json", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
  ]);
  const parsed = JSON.parse(data);
  assert.equal(parsed.cases.length, 896);
  assert.equal(parsed.summary.headline.movers, 460);
  assert.equal(parsed.summary.headline.rate, 51.3);
  assert.equal(parsed.cases.filter((item) => /^https:\/\/www\.courtlistener\.com\/opinion\/\d+\/$/.test(item.full_text_url)).length, 896);
  assert.ok(parsed.hudson.entries.length >= 80);
  assert.match(page, /atlas-data\.json/);
  assert.match(layout, /Federal Criminal Common Law Atlas/);
  assert.doesNotMatch(app, /counsel-only citator artifacts|confirmed false positive|<span>Status<\/span>/);
  assert.match(app, /excluded from the research explorer and role charts/);
  assert.match(packageJson, /"build:pages"/);
  assert.match(nextConfig, /output:\s*pagesBuild\s*\?\s*"export"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
