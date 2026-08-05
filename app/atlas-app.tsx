"use client";

import { useMemo, useState } from "react";

type Evidence = {
  field: string;
  value: string;
  quote: string;
  pincite: string;
  coder: string;
  confidence: number | null;
};

type CaseRecord = {
  id: number;
  name: string;
  citation: string;
  date: string;
  year: number;
  period: string;
  twenty_year_period: string;
  mover: boolean;
  modes: string[];
  acknowledgments: string[];
  hooks: string[];
  topics: string[];
  statutes: string[];
  opinion_authors: string[];
  boundary: Record<string, string | boolean>;
  citation_links: number[];
  citation_in_degree: number;
  evidence: Evidence[];
};

type HudsonEntry = {
  id: string;
  case_id: number | null;
  name: string;
  citation: string;
  year: number;
  period: string;
  status: string;
  roles: string[];
  contexts: { excerpt: string; opinion_type: string; author: string; roles: string[] }[];
  note: string;
  provenance: string;
};

type RateRow = { period: string; cases: number; movers: number; rate: number };
type PeriodCountRow = {
  period: string;
  cases: number;
  movers?: number;
  counts: Record<string, number>;
};
type AcknowledgmentRow = PeriodCountRow & { movers: number; rhetoric_gap_union: number };
type TopicRow = { topic: string; cases: number; movers: number; rate: number };
type RobustnessRow = {
  specification: string;
  cases: number;
  movers: number;
  rate: number;
  note: string;
};
type AdjudicationRow = { stage: string; movers: number; rate: number };

type AtlasSummary = {
  headline: { cases: number; movers: number; rate: number };
  by_period: RateRow[];
  by_twenty_year_period: RateRow[];
  mode_by_period: PeriodCountRow[];
  acknowledgment_by_period: AcknowledgmentRow[];
  source_use_by_period: PeriodCountRow[];
  topic_stats: TopicRow[];
  robustness: RobustnessRow[];
  adjudication_flow: AdjudicationRow[];
  prompt_sensitivity: Record<string, string | number>;
  hudson_role_evolution: { period: string; counts: Record<string, number> }[];
  limitations: string[];
};

type AtlasData = {
  meta: Record<string, string | number>;
  summary: AtlasSummary;
  hudson: {
    method: Record<string, string | number>;
    phases: { period: string; title: string; description: string; milestones: string[] }[];
    role_counts: Record<string, number>;
    status_counts: Record<string, number>;
    period_role_counts: { period: string; counts: Record<string, number> }[];
    entries: HudsonEntry[];
  };
  cases: CaseRecord[];
};

const display = (value: string) => value.replaceAll("_", " ");
const percent = (numerator: number, denominator: number) =>
  denominator ? Math.round((1000 * numerator) / denominator) / 10 : 0;

function Bar({ value, max = 100, tone = "ink" }: { value: number; max?: number; tone?: string }) {
  return (
    <span className="bar-track" aria-label={`${value}%`}>
      <span className={`bar-fill tone-${tone}`} style={{ width: `${Math.min(100, (100 * value) / max)}%` }} />
    </span>
  );
}

function SectionIntro({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <div className="section-intro">
      <p className="eyebrow">{kicker}</p>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

function ChangeView({ data }: { data: AtlasData }) {
  const summary = data.summary;
  const maxTopic = Math.max(...summary.topic_stats.slice(0, 14).map((row) => row.cases));
  const sourceNames = [
    "legislative history — narrow",
    "treatise relied on",
    "state precedent relied on",
    "MPC relied on",
    "lenity applied",
  ];

  return (
    <main id="main-content">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Supreme Court · 1789–2026</p>
          <h1>The Court renounced common-law crimes. It kept making criminal law.</h1>
          <p className="hero-deck">
            A coded census of 896 decisions shows not a disappearance, but a migration: judicial rule production moved inside statutes, general-part doctrine, and defenses.
          </p>
        </div>
        <div className="hero-stats" aria-label="Headline findings">
          <div><strong>460</strong><span>cases with a common-law-like move</span></div>
          <div><strong>51.3%</strong><span>of the constructed corpus</span></div>
          <div><strong>389</strong><span>movers framed as compelled or contested</span></div>
          <div><strong>45</strong><span>movers explicitly owning the choice</span></div>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Figure 1" title="The long arc is U-shaped, not a steady decline">
          Common-law-like moves are most common in the early Court, fall to a low in 1900–1939, then rebound after 1940. These are descriptive corpus rates, not causal estimates.
        </SectionIntro>
        <div className="period-chart">
          {summary.by_period.map((row) => (
            <div className="period-column" key={row.period}>
              <div className="column-value">{row.rate}%</div>
              <div className="column-shell"><span style={{ height: `${row.rate}%` }} /></div>
              <strong>{row.period}</strong>
              <small>{row.movers} / {row.cases}</small>
            </div>
          ))}
        </div>
        <details className="detail-table">
          <summary>See finer twenty-year intervals</summary>
          <div className="matrix">
            {summary.by_twenty_year_period.map((row) => (
              <div className="matrix-row" key={row.period}>
                <span>{row.period}</span><Bar value={row.rate} /><strong>{row.rate}%</strong><small>{row.movers}/{row.cases}</small>
              </div>
            ))}
          </div>
        </details>
      </section>

      <section className="content-section split-section">
        <div>
          <SectionIntro kicker="Figure 2" title="The mechanism changes">
            Old-soil reasoning dominates the nineteenth century. Creation becomes the largest coded mode after 1940. Counts are nonexclusive and subtype detail remains provisional.
          </SectionIntro>
          <div className="matrix mode-matrix">
            {summary.mode_by_period.map((row) => (
              <div className="mode-block" key={row.period}>
                <strong>{row.period}</strong>
                {(["creation", "old_soil", "evolving", "common_law_offense"] as const).map((mode) => {
                  const count = row.counts[mode] || 0;
                  return <div className="mini-row" key={mode}><span>{display(mode)}</span><Bar value={percent(count, row.cases)} tone={mode === "creation" ? "rust" : mode === "old_soil" ? "blue" : "gold"} /><small>{count}</small></div>;
                })}
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionIntro kicker="Figure 3" title="The rhetoric gap persists—and changes form">
            Before 1940, the Court usually presents common-law-like moves as compelled. After 1940, separate opinions increasingly expose the choice. Explicit acknowledgment remains unusual.
          </SectionIntro>
          <div className="matrix rhetoric-matrix">
            {summary.acknowledgment_by_period.map((row) => {
              const compelledRate = percent(row.counts.presented_as_compelled || 0, row.movers);
              const contestedRate = percent(row.counts.contested || 0, row.movers);
              const explicitRate = percent(row.counts.explicit || 0, row.movers);
              return (
                <div className="rhetoric-row" key={row.period}>
                  <strong>{row.period}</strong>
                  <label>Presented as compelled <Bar value={compelledRate} tone="blue" /><b>{compelledRate}%</b></label>
                  <label>Contested <Bar value={contestedRate} tone="rust" /><b>{contestedRate}%</b></label>
                  <label>Explicit <Bar value={explicitRate} tone="gold" /><b>{explicitRate}%</b></label>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Figure 4" title="The interpretive toolkit changes with the doctrine">
          State precedent and treatises matter early; legislative materials and the Model Penal Code rise later. These fields retain unresolved smaller disputes and are best read as directional.
        </SectionIntro>
        <div className="toolkit-grid">
          {summary.source_use_by_period.map((row) => (
            <article key={row.period}>
              <h3>{row.period}</h3>
              {sourceNames.map((source) => {
                const count = row.counts[source] || 0;
                return <div className="tool-row" key={source}><span>{source}</span><Bar value={percent(count, row.cases)} tone="blue" /><small>{percent(count, row.cases)}%</small></div>;
              })}
            </article>
          ))}
        </div>
      </section>

      <section className="content-section split-section">
        <div>
          <SectionIntro kicker="Figure 5" title="Where lawmaking concentrates">
            Topic tags identify doctrinal neighborhoods, not mutually exclusive causes. The strongest rates appear in mens rea, accomplice liability, burden allocation, public-welfare offenses, and criminal contempt.
          </SectionIntro>
          <div className="topic-list">
            {summary.topic_stats.slice(0, 14).map((row) => (
              <div className="topic-row" key={row.topic}>
                <span>{display(row.topic)}</span><Bar value={row.cases} max={maxTopic} tone="gold" /><strong>{row.rate}%</strong><small>n={row.cases}</small>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionIntro kicker="Figure 6" title="The headline survived a demanding correction process">
            Blind adjudication reduced the preliminary count; an independent review of every headline-changing decision and five-case tiebreak produced the final 460.
          </SectionIntro>
          <div className="flow-chart">
            {summary.adjudication_flow.map((row, index: number) => (
              <div key={row.stage}><span>{index + 1}</span><strong>{row.movers}</strong><p>{row.stage}</p><small>{row.rate}% of 896</small></div>
            ))}
          </div>
          <div className="callout">
            <strong>Prompt sensitivity is substantive.</strong>
            <p>On the same 20 cases, a same-model shadow run coded 55% “none” with the anti-overcoding instruction and 15% without it. Eight headline verdicts flipped. The unqualified run was quarantined.</p>
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Robustness" title="The central finding does not depend on the early common-law-offense cases">
          Alternative descriptive specifications change the magnitude, but the result remains substantial. Mode-only rows answer narrower questions and are not competing estimates of the same construct.
        </SectionIntro>
        <div className="robustness-table" role="table" aria-label="Robustness specifications">
          {summary.robustness.map((row) => (
            <div className="robustness-row" role="row" key={row.specification}>
              <strong role="cell">{row.specification}</strong><span role="cell">{row.movers} / {row.cases}</span><Bar value={row.rate} tone="rust" /><b role="cell">{row.rate}%</b>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function HudsonView({ data, onOpenCase }: { data: AtlasData; onOpenCase: (id: number) => void }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("verified");
  const roles = Object.keys(data.hudson.role_counts);
  const entries = useMemo(() => data.hudson.entries.filter((entry) => {
    const text = `${entry.name} ${entry.citation} ${entry.contexts.map((item) => item.excerpt).join(" ")}`.toLowerCase();
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matchesRole = role === "all" || entry.roles.includes(role);
    const matchesStatus = status === "all" || (status === "verified" ? entry.status.includes("verified") || entry.status.includes("application") : entry.status === status);
    return matchesQuery && matchesRole && matchesStatus;
  }), [data.hudson.entries, query, role, status]);

  return (
    <main id="main-content">
      <section className="hudson-hero">
        <p className="eyebrow">A case with multiple afterlives</p>
        <h1>What did <em>Hudson &amp; Goodwin</em> come to mean?</h1>
        <p>The 1812 opinion began as a limit on inferior-court criminal jurisdiction. Later Courts made it a statutory-grounding canon, an Erie-like lawmaking limit, and a source of inherent judicial power.</p>
        <div className="hudson-counts">
          <div><strong>{data.hudson.status_counts["verified judicial context"] + 1}</strong><span>verified judicial uses or express application</span></div>
          <div><strong>{data.hudson.status_counts["counsel argument only"]}</strong><span>counsel-only citator artifacts</span></div>
          <div><strong>{data.hudson.status_counts["false positive"]}</strong><span>confirmed false positive</span></div>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Interpretive chronology" title="Five phases in the case’s transformation">
          The phases organize changes in use, not changes to Hudson’s formal holding. Later opinions repeatedly repurpose different sentences of the short opinion.
        </SectionIntro>
        <div className="phase-timeline">
          {data.hudson.phases.map((phase, index) => (
            <article key={phase.period}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p className="phase-period">{phase.period}</p>
              <h3>{phase.title}</h3>
              <p>{phase.description}</p>
              <small>{phase.milestones.join(" · ")}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Citation roles" title="The opinion’s criminal rule never traveled alone">
          Role tags are nonexclusive. The criminal-legality line grows alongside distinct jurisdictional and inherent-powers lines, explaining why a raw citation count obscures doctrinal change.
        </SectionIntro>
        <div className="role-evolution">
          {data.hudson.period_role_counts.map((row) => {
            const total = Math.max(1, ...Object.values(row.counts));
            return <article key={row.period}><h3>{row.period}</h3>{roles.map((item) => <div className="tool-row" key={item}><span>{item}</span><Bar value={row.counts[item] || 0} max={total} tone={item.includes("criminal") ? "rust" : "blue"} /><small>{row.counts[item] || 0}</small></div>)}</article>;
          })}
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Hudson explorer" title="Inspect every record and its provenance">
          Search the citing passage, filter by role, and keep counsel arguments and database-only records separate from judicial use.
        </SectionIntro>
        <div className="filters hudson-filters">
          <label className="search-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Case, citation, or quoted phrase" /></label>
          <label><span>Role</span><select value={role} onChange={(event) => setRole(event.target.value)}><option value="all">All roles</option>{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="verified">Verified judicial uses</option><option value="all">All records</option>{Object.keys(data.hudson.status_counts).map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <p className="result-count">{entries.length} records shown</p>
        <div className="hudson-list">
          {entries.map((entry) => (
            <article key={entry.id}>
              <div className="year-badge">{entry.year}</div>
              <div>
                <p className="eyebrow">{entry.status}</p>
                <h3>{entry.name}</h3>
                <p className="citation">{entry.citation}</p>
                <div className="chips">{entry.roles.map((item) => <span key={item}>{item}</span>)}</div>
                {entry.contexts[0] && <blockquote>{entry.contexts[0].excerpt}</blockquote>}
                {entry.note && <p className="entry-note">{entry.note}</p>}
                {entry.case_id && <button className="text-button" onClick={() => onOpenCase(entry.case_id!)}>Open this case in the Atlas →</button>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function CasesView({ data, selected, setSelected }: { data: AtlasData; selected: CaseRecord | null; setSelected: (item: CaseRecord | null) => void }) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [mode, setMode] = useState("all");
  const [topic, setTopic] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [sort, setSort] = useState("oldest");
  const [limit, setLimit] = useState(48);
  const topics = useMemo(() => [...new Set(data.cases.flatMap((item) => item.topics))].sort(), [data.cases]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    const rows = data.cases.filter((item) => {
      const haystack = `${item.name} ${item.citation} ${item.year} ${item.topics.join(" ")} ${item.statutes.join(" ")} ${item.evidence.map((row) => `${row.value} ${row.quote}`).join(" ")}`.toLowerCase();
      return (!needle || haystack.includes(needle)) && (period === "all" || item.period === period) && (mode === "all" || item.modes.includes(mode)) && (topic === "all" || item.topics.includes(topic)) && (outcome === "all" || (outcome === "mover" ? item.mover : !item.mover));
    });
    rows.sort((a, b) => sort === "newest" ? b.year - a.year : sort === "name" ? a.name.localeCompare(b.name) : sort === "cited" ? b.citation_in_degree - a.citation_in_degree : a.year - b.year);
    return rows;
  }, [data.cases, query, period, mode, topic, outcome, sort]);

  const exportCsv = () => {
    const escape = (value: string | number | boolean) => `"${String(value).replaceAll('"', '""')}"`;
    const lines = [["case_id", "case_name", "citation", "year", "mover", "modes", "acknowledgments", "topics"].join(","), ...filtered.map((item) => [item.id, item.name, item.citation, item.year, item.mover, item.modes.join(" | "), item.acknowledgments.join(" | "), item.topics.join(" | ")].map(escape).join(","))];
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    link.download = "fccl-atlas-filtered-cases.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main id="main-content">
      <section className="atlas-heading">
        <div><p className="eyebrow">896 cases · complete double coding</p><h1>Case Atlas</h1><p>Search cases, statutes, topics, and coded evidence. Filters work together; download the current result set as CSV.</p></div>
        <button className="download-button" onClick={exportCsv}>Download filtered CSV</button>
      </section>
      <section className="atlas-workspace">
        <aside className="filters case-filters">
          <label className="search-field"><span>Search everything</span><input value={query} onChange={(event) => { setQuery(event.target.value); setLimit(48); }} placeholder="e.g. mens rea, Pinkerton, 18 U.S.C. § 2" /></label>
          <label><span>Period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">All periods</option>{data.summary.by_period.map((row) => <option key={row.period}>{row.period}</option>)}</select></label>
          <label><span>Mode</span><select value={mode} onChange={(event) => setMode(event.target.value)}><option value="all">All modes</option>{["creation", "old_soil", "evolving", "common_law_offense", "none"].map((item) => <option key={item} value={item}>{display(item)}</option>)}</select></label>
          <label><span>Topic</span><select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="all">All topics</option>{topics.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Headline</span><select value={outcome} onChange={(event) => setOutcome(event.target.value)}><option value="all">All cases</option><option value="mover">Common-law-like move</option><option value="none">No move</option></select></label>
          <label><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="oldest">Oldest first</option><option value="newest">Newest first</option><option value="name">Case name</option><option value="cited">Most cited in corpus</option></select></label>
        </aside>
        <div className="case-results">
          <p className="result-count">{filtered.length} of 896 cases</p>
          <div className="case-grid">
            {filtered.slice(0, limit).map((item) => (
              <button className="case-card" key={item.id} onClick={() => setSelected(item)}>
                <span className={`verdict ${item.mover ? "move" : "no-move"}`}>{item.mover ? "common-law-like move" : "no coded move"}</span>
                <h3>{item.name}</h3>
                <p>{item.citation || item.date} · {item.year}</p>
                <div className="chips">{item.modes.map((modeName) => <span key={modeName}>{display(modeName)}</span>)}</div>
                <small>{item.topics.slice(0, 3).map(display).join(" · ") || "untagged"}</small>
              </button>
            ))}
          </div>
          {limit < filtered.length && <button className="load-more" onClick={() => setLimit((value) => value + 48)}>Show 48 more</button>}
        </div>
      </section>
      {selected && <CaseDrawer item={selected} data={data} onClose={() => setSelected(null)} onNavigate={(id) => setSelected(data.cases.find((item) => item.id === id) || null)} />}
    </main>
  );
}

function CaseDrawer({ item, data, onClose, onNavigate }: { item: CaseRecord; data: AtlasData; onClose: () => void; onNavigate: (id: number) => void }) {
  const citations = item.citation_links.map((id) => data.cases.find((record) => record.id === id)).filter(Boolean) as CaseRecord[];
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="case-drawer" role="dialog" aria-modal="true" aria-labelledby="case-title">
        <button className="close-button" onClick={onClose} aria-label="Close case details">×</button>
        <p className="eyebrow">{item.period} · Case {item.id}</p>
        <h2 id="case-title">{item.name}</h2>
        <p className="drawer-citation">{item.citation || item.date}</p>
        <div className="drawer-verdict"><strong>{item.mover ? "Common-law-like move" : "No common-law-like move"}</strong><span>{item.modes.map(display).join(" · ")}</span></div>
        <dl>
          <div><dt>Acknowledgment</dt><dd>{item.acknowledgments.map(display).join(" · ") || "—"}</dd></div>
          <div><dt>Statutory hook</dt><dd>{item.hooks.map(display).join(" · ") || "—"}</dd></div>
          <div><dt>Topics</dt><dd>{item.topics.map(display).join(" · ") || "—"}</dd></div>
          <div><dt>Statutes</dt><dd>{item.statutes.join(" · ") || "—"}</dd></div>
          <div><dt>Opinion authors in data</dt><dd>{item.opinion_authors.join(" · ") || "—"}</dd></div>
        </dl>
        <h3>Coded evidence</h3>
        <div className="evidence-list">
          {item.evidence.map((row, index) => <article key={`${row.field}-${index}`}><p className="eyebrow">{display(row.field)} · {row.value}</p>{row.quote && <blockquote>“{row.quote}”</blockquote>}<small>{row.pincite || "No pincite"} · {row.coder}</small></article>)}
        </div>
        {citations.length > 0 && <><h3>Earlier corpus cases cited</h3><div className="citation-links">{citations.slice(0, 20).map((record) => <button key={record.id} onClick={() => onNavigate(record.id)}>{record.name} <span>{record.citation}</span></button>)}</div></>}
      </aside>
    </div>
  );
}

function MethodsView({ data }: { data: AtlasData }) {
  return (
    <main id="main-content">
      <section className="methods-hero"><p className="eyebrow">How to read the Atlas</p><h1>Method, uncertainty, and reproducibility</h1><p>The site exposes the protocol’s seams because the measurement question is part of the scholarly contribution.</p></section>
      <section className="methods-grid">
        <article><span>01</span><h2>Population</h2><p>The unit is a Supreme Court decision in a constructed census of 896 included federal criminal-law cases, 1789–2026. The corpus is not a random sample and does not support causal inference.</p></article>
        <article><span>02</span><h2>Independent coding</h2><p>Every included case received at least two independent primary coding runs under codebook v0.6. Multi-mode and multi-acknowledgment coding is nonexclusive.</p></article>
        <article><span>03</span><h2>Blind adjudication</h2><p>All 179 headline-relevant disputes were adjudicated. Every one of the 57 headline-changing decisions received an independent blind reread; five disagreements received a third tiebreak.</p></article>
        <article><span>04</span><h2>What is final</h2><p>The 460/896 binary headline and acknowledgment distribution are final under the protocol. Smaller mode, hook, and source-use disputes were intentionally left unresolved and are labeled provisional.</p></article>
        <article><span>05</span><h2>Hudson audit</h2><p>Commercial citator results were cross-checked against opinion full text. Counsel arguments printed in early U.S. Reports, false positives, and uncertain records are not silently treated as judicial citations.</p></article>
        <article><span>06</span><h2>Citation graph</h2><p>The case-to-case graph is extracted by reporter-citation regex from local opinion text. It is a floor: name-only references and OCR failures remain invisible.</p></article>
      </section>
      <section className="content-section">
        <SectionIntro kicker="Known limits" title="Precision without false certainty">
          The Atlas is designed for inspection and hypothesis generation. Published quotations should still be checked against the bound U.S. Reports.
        </SectionIntro>
        <ul className="limits-list">{data.summary.limitations.map((item: string) => <li key={item}>{item}</li>)}</ul>
      </section>
    </main>
  );
}

export function AtlasApp({ data: rawData }: { data: unknown }) {
  const data = rawData as AtlasData;
  const [view, setView] = useState("change");
  const [selected, setSelected] = useState<CaseRecord | null>(null);

  const openCase = (id: number) => {
    const item = data.cases.find((record) => record.id === id) || null;
    setSelected(item);
    setView("cases");
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <button className="wordmark" onClick={() => setView("change")} aria-label="Federal Criminal Common Law Atlas home"><span>FCCL</span><b>Atlas</b></button>
        <nav aria-label="Primary navigation">
          {[["change", "Change over time"], ["hudson", "Hudson genealogy"], ["cases", "Case Atlas"], ["methods", "Methods"]].map(([id, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>{label}</button>)}
        </nav>
        <div className="header-meta">Data through Aug. 5, 2026</div>
      </header>
      {view === "change" && <ChangeView data={data} />}
      {view === "hudson" && <HudsonView data={data} onOpenCase={openCase} />}
      {view === "cases" && <CasesView data={data} selected={selected} setSelected={setSelected} />}
      {view === "methods" && <MethodsView data={data} />}
      <footer><span>Federal Criminal Common Law Atlas</span><p>Canonical data: fccl.db · Codebook v0.6 · Descriptive corpus analysis</p></footer>
    </div>
  );
}
