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
  const opinionUrl = /^https:\/\/www\.courtlistener\.com\/opinion\/\d+\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/;
  assert.equal(parsed.cases.filter((item) => opinionUrl.test(item.full_text_url)).length, 896);
  assert.equal(new Set(parsed.cases.map((item) => item.full_text_url)).size, 896);
  assert.ok(parsed.hudson.entries.length >= 80);
  assert.match(page, /atlas-data\.json/);
  assert.match(layout, /Federal Criminal Common Law Atlas/);
  const researchViews = app.slice(app.indexOf("function ChangeView"), app.indexOf("function MethodsView"));
  const methodsView = app.slice(app.indexOf("function MethodsView"));
  assert.doesNotMatch(researchViews, /counsel-only|false positive|prompt sensitivity|adjudication|<span>Status<\/span>/i);
  assert.match(methodsView, /excluded from the research explorer and role charts/);
  assert.match(packageJson, /"build:pages"/);
  assert.match(nextConfig, /output:\s*pagesBuild\s*\?\s*"export"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("ships the plain-English explainer without breaching the research/audit boundary", async () => {
  const app = await readFile(new URL("../app/atlas-app.tsx", import.meta.url), "utf8");

  // The explainer is a nav-reachable view.
  assert.match(app, /function HowItWorksView/);
  assert.match(app, /\["how", "How it works"\]/);
  assert.match(app, /view === "how" && <HowItWorksView/);

  // It must live BELOW MethodsView. The explainer discusses adjudication, prompt
  // sensitivity, and the verification asymmetry by design; defining it above
  // MethodsView would pull that language into the research-view slice asserted
  // clean in the test above.
  assert.ok(
    app.indexOf("function HowItWorksView") > app.indexOf("function MethodsView"),
    "HowItWorksView must be declared after MethodsView to stay outside the research-view slice",
  );

  // The explainer must keep its load-bearing caveats: they are the reason the
  // page exists for a non-technical reader.
  const explainer = app.slice(app.indexOf("const MODE_GLOSSARY"));
  for (const caveat of [
    /prompt wording moves the results/i,
    /agreements were never audited/i,
    /could only push the number up/i,
    /50\.8%/,
    /human-coded gold set/i,
  ]) {
    assert.match(explainer, caveat);
  }

  // The default landing view is still the research view, not the explainer.
  const html = await (await render()).text();
  assert.doesNotMatch(html, /How the study works/);
  assert.match(html, /How it works/);
});
