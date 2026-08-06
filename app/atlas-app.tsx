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
  full_text_url: string;
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
          State precedent and treatises matter early; legislative materials and the Model Penal Code rise later. Read these secondary source-use measures as directional.
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

      <section className="content-section">
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
  const roles = Object.keys(data.hudson.role_counts);
  const entries = useMemo(() => data.hudson.entries.filter((entry) => {
    const isJudicialUse = entry.status === "verified judicial context" || entry.status === "application and express preservation";
    const text = `${entry.name} ${entry.citation} ${entry.contexts.map((item) => item.excerpt).join(" ")}`.toLowerCase();
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matchesRole = role === "all" || entry.roles.includes(role);
    return isJudicialUse && matchesQuery && matchesRole;
  }), [data.hudson.entries, query, role]);

  return (
    <main id="main-content">
      <section className="hudson-hero">
        <p className="eyebrow">A case with multiple afterlives</p>
        <h1>What did <em>Hudson &amp; Goodwin</em> come to mean?</h1>
        <p>The 1812 opinion began as a limit on inferior-court criminal jurisdiction. Later Courts made it a statutory-grounding canon, an Erie-like lawmaking limit, and a source of inherent judicial power.</p>
        <div className="hudson-counts">
          <div><strong>{data.hudson.status_counts["verified judicial context"] + 1}</strong><span>verified judicial uses or express application</span></div>
          <div><strong>{data.hudson.role_counts["criminal legality and statutory definition"]}</strong><span>criminal-legality or statutory-definition uses</span></div>
          <div><strong>{data.hudson.role_counts["inherent judicial power"]}</strong><span>inherent-power uses</span></div>
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
        <SectionIntro kicker="Hudson explorer" title="Trace how later opinions used the case">
          Search verified judicial passages by case, citation, quoted language, or doctrinal role.
        </SectionIntro>
        <div className="filters hudson-filters">
          <label className="search-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Case, citation, or quoted phrase" /></label>
          <label><span>Role</span><select value={role} onChange={(event) => setRole(event.target.value)}><option value="all">All roles</option>{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <p className="result-count">{entries.length} judicial uses shown</p>
        <div className="hudson-list">
          {entries.map((entry) => (
            <article key={entry.id}>
              <div className="year-badge">{entry.year}</div>
              <div>
                <h3>{entry.name}</h3>
                <p className="citation">{entry.citation}</p>
                <div className="chips">{entry.roles.map((item) => <span key={item}>{item}</span>)}</div>
                {entry.contexts[0] && <blockquote>{entry.contexts[0].excerpt}</blockquote>}
                {!entry.contexts[0] && entry.note && !entry.note.includes("OCR") && <p className="entry-note">{entry.note}</p>}
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
    const lines = [["case_id", "case_name", "citation", "year", "full_text_url", "mover", "modes", "acknowledgments", "topics"].join(","), ...filtered.map((item) => [item.id, item.name, item.citation, item.year, item.full_text_url, item.mover, item.modes.join(" | "), item.acknowledgments.join(" | "), item.topics.join(" | ")].map(escape).join(","))];
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    link.download = "fccl-atlas-filtered-cases.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main id="main-content">
      <section className="atlas-heading">
        <div><p className="eyebrow">Supreme Court · 1789–2026</p><h1>Case Atlas</h1><p>Search 896 cases by name, statute, doctrine, and evidence passage. Filters work together; download the current result set as CSV.</p></div>
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
                <span className={`verdict ${item.mover ? "move" : "no-move"}`}>{item.mover ? "common-law-like move" : "no common-law-like move"}</span>
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
        <p className="eyebrow">{item.period}</p>
        <h2 id="case-title">{item.name}</h2>
        <p className="drawer-citation">{item.citation || item.date}</p>
        <a className="opinion-link" href={item.full_text_url} target="_blank" rel="noreferrer">
          Read full opinion on CourtListener <span aria-hidden="true">↗</span>
        </a>
        <div className="drawer-verdict"><strong>{item.mover ? "Common-law-like move" : "No common-law-like move"}</strong><span>{item.modes.map(display).join(" · ")}</span></div>
        <dl>
          <div><dt>Acknowledgment</dt><dd>{item.acknowledgments.map(display).join(" · ") || "—"}</dd></div>
          <div><dt>Statutory hook</dt><dd>{item.hooks.map(display).join(" · ") || "—"}</dd></div>
          <div><dt>Topics</dt><dd>{item.topics.map(display).join(" · ") || "—"}</dd></div>
          <div><dt>Statutes</dt><dd>{item.statutes.join(" · ") || "—"}</dd></div>
          <div><dt>Opinion authors</dt><dd>{item.opinion_authors.join(" · ") || "—"}</dd></div>
        </dl>
        <h3>Coded evidence</h3>
        <div className="evidence-list">
          {item.evidence.map((row, index) => <article key={`${row.field}-${index}`}><p className="eyebrow">{display(row.field)} · {row.value}</p>{row.quote && <blockquote>“{row.quote}”</blockquote>}{row.pincite && <small>{row.pincite}</small>}</article>)}
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
        <article><span>03</span><h2>Blind adjudication</h2><p>All 179 headline-relevant disputes were adjudicated. Every one of the 57 headline-changing decisions received an independent blind reread; five disagreements received a third tiebreak. A separate 20-case prompt test was quarantined from the headline.</p></article>
        <article><span>04</span><h2>What is final</h2><p>The 460/896 binary headline and acknowledgment distribution are final under the protocol. Smaller mode, hook, and source-use disputes were intentionally left unresolved and are labeled provisional.</p></article>
        <article><span>05</span><h2>Hudson audit</h2><p>Commercial citator results were cross-checked against opinion full text. Five counsel-only appearances, one false positive, one unresolved record, and one topic-only record remain in the audit data but are excluded from the research explorer and role charts.</p></article>
        <article><span>06</span><h2>Citation graph</h2><p>The case-to-case graph is extracted by reporter-citation regex from local opinion text. It is a floor: name-only references and OCR failures remain invisible.</p></article>
      </section>
      <section className="content-section">
        <SectionIntro kicker="Measurement audit" title="How the headline was tested">
          Adjudication and prompt-sensitivity checks are reported here so the research views can remain focused on cases, doctrine, and change over time.
        </SectionIntro>
        <div className="flow-chart">
          {data.summary.adjudication_flow.map((row, index: number) => (
            <div key={row.stage}><span>{index + 1}</span><strong>{row.movers}</strong><p>{row.stage}</p><small>{row.rate}% of 896</small></div>
          ))}
        </div>
        <div className="callout">
          <strong>Prompt sensitivity check</strong>
          <p>On the same 20 cases, a same-model shadow run coded 55% “none” with the anti-overcoding instruction and 15% without it. Eight headline verdicts flipped. The unqualified run was quarantined and never entered the Atlas headline.</p>
        </div>
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

const MODE_GLOSSARY = [
  {
    label: "old soil",
    gloss: "The Court says a word in the statute was borrowed from older law, so it arrives carrying that older law’s meaning. “If a word is obviously transplanted, it brings the old soil with it.”",
    example: "Reading “knowingly” to import the common law’s intent requirement — Morissette v. United States, 342 U.S. 246 (1952).",
  },
  {
    label: "evolving",
    gloss: "The Court reads an old statute using law that came later — above all the Model Penal Code (1962), but also modern treatises and trends in state law.",
    example: "Adopting the Model Penal Code’s “substantial step” test for attempt.",
  },
  {
    label: "creation",
    gloss: "The rule comes from neither a settled older backdrop nor a modern body of law. The Court builds it, usually reasoning from blameworthiness or practical consequence.",
    example: "The entrapment defense — Sorrells v. United States, 287 U.S. 435 (1932).",
  },
  {
    label: "common-law offense",
    gloss: "There is no criminal statute at all — either a genuine common-law prosecution, or a holding about whether federal common-law crimes can exist.",
    example: "United States v. Hudson & Goodwin, 11 U.S. (7 Cranch) 32 (1812); after 1816 the category survives only in criminal contempt.",
  },
  {
    label: "none",
    gloss: "Ordinary statutory interpretation. The text resolves the question and the Court follows it. No common-law-like move.",
    example: "436 of the 896 cases.",
  },
];

const HOOK_GLOSSARY = [
  ["term-anchored", "The statute contains the loaded term of art, and its inherited meaning does the work."],
  ["term-anchored (explicit)", "The statute orders the transplant. Congress wrote “piracy, as defined by the law of nations” — the Court did not choose the old soil."],
  ["silence-filling", "The statute says nothing on the question and the Court supplies the answer."],
  ["text-overriding", "The statute does speak, and the Court’s reading bends or overrides it."],
  ["conventional", "The text resolves the issue and the Court follows."],
  ["no statute", "There is no offense statute at all."],
];

const ACK_GLOSSARY = [
  ["explicit", "The Court admits the choice. “Congress, of course, has never spoken on the subject, and so the decision is left to the courts.” — Mathews v. United States, 485 U.S. 58 (1988)."],
  ["presented as compelled", "A real choice, framed as required, derived, or long settled. This is the category the argument turns on."],
  ["contested", "A concurrence or dissent calls out the lawmaking the majority denies."],
  ["not addressed", "The move is made silently — no admission, no compelled framing, no dissent."],
  ["disclaims", "The Court expressly denies having any lawmaking power. “It is the legislature, not the court, which is to define a crime.” — United States v. Wiltberger, 18 U.S. (5 Wheat.) 76 (1820)."],
];

const CAVEATS = [
  {
    title: "Prompt wording moves the results",
    body: "The clearest warning sign in the project. The same model, reading the same 20 cases, returned 55% “none” when the instructions cautioned against over-coding and 15% without that sentence. Eight of twenty verdicts flipped. The affected run was quarantined and excluded. The lesson stands: 51.3% is the answer under a specific frozen protocol, not a fact of nature.",
  },
  {
    title: "The agreements were never audited",
    body: "Verification effort went to cases where the two readers disagreed. But 735 of 896 cases — 82% — are ones where they agreed, and those supply 432 of the 460 movers. Two models trained on overlapping material, reading the same codebook, can be wrong in the same direction. No random sample of the agreements has been checked against an independent standard.",
  },
  {
    title: "The verification step could only push the number up",
    body: "Only the 57 adjudications that changed a verdict were re-read. By construction, overturning one could only restore the prior answer — and the headline moved up, 457 to 460. The 51 adjudications that confirmed the standing verdict were never re-read. This does not make 460 too high; it means the correction channel ran one way and should be disclosed.",
  },
  {
    title: "The margin is thin",
    body: "51.3% is 1.3 points above half. Five of the 460 movers rest entirely on a separate opinion — a dissent or concurrence making the move, not the Court. Counting majority opinions only gives 455/896 = 50.8%. Still more than half, barely.",
  },
  {
    title: "Quotations were checked against the wrong text",
    body: "Quotation verification ran against CourtListener’s opinion text, which for older cases is OCR of scanned volumes and contains errors. Anything quoted in print must be re-checked against the official U.S. Reports.",
  },
  {
    title: "644 smaller disputes are unresolved",
    body: "Across 406 cases the two readers still disagree on finer points — which kind of old soil, whether a treatise was used. None can change the headline or the acknowledgment table. They do mean the subtype and source-use breakdowns are directional, not final.",
  },
  {
    title: "Scope",
    body: "This is a census of Supreme Court merits opinions. It says nothing directly about federal prosecutions generally or about the lower courts. And frequency alone does not establish that anything is illegitimate — that is the article’s argument, not the data’s.",
  },
];

const IMPROVEMENTS = [
  {
    title: "Audit the agreements",
    body: "Draw a random sample of cases where both readers agreed — say 30 “law” and 30 “none” — and have them read against a genuinely independent standard. Declare the sample size, seed, and stopping rule in advance so the result cannot be shopped. Weight back to the full corpus and report the corrected estimate with its margin of error. If “more than half” is load-bearing, this is what makes it defensible.",
  },
  {
    title: "Publish the robustness numbers before anyone asks",
    body: "State 50.8% — majority opinions only — in the text or an early footnote. Volunteering it is far stronger than conceding it under questioning.",
  },
  {
    title: "Close the provenance hole",
    body: "Have every coding and adjudication run record itself: model, settings, exact prompt text, codebook version, timestamp. Twenty lines of code. Cheap now, unfixable once memory of the run fades.",
  },
  {
    title: "State the verification asymmetry",
    body: "Wherever 460 is defended, say plainly that only verdict-changing decisions were re-read. Optionally re-read the 51 confirming ones.",
  },
  {
    title: "Build a human-coded gold set",
    body: "The deepest answer to “why believe a machine read these correctly?” is a set of cases coded by hand, against which the machine coding can be scored. Even 50 cases would yield a real accuracy figure instead of an agreement figure. That is the difference between “two readers agreed” and “the coding is right.”",
  },
  {
    title: "Test the prompt sensitivity systematically",
    body: "Rather than treating it only as a caveat, run a large sample under two or three deliberately different framings and report the range. A headline stated as a range under stated stringency is more honest, and harder to attack, than a point estimate with a footnote.",
  },
];

function HowItWorksView({ data }: { data: AtlasData }) {
  const summary = data.summary;
  const headline = summary.headline;
  const prompt = summary.prompt_sensitivity;

  return (
    <main id="main-content">
      <section className="methods-hero">
        <p className="eyebrow">Plain-English guide</p>
        <h1>How the study works</h1>
        <p>
          No technical background assumed. This page explains what was counted, what the categories mean,
          how {headline.cases} cases were actually read, what came out, and where the study is weakest.
        </p>
      </section>

      <section className="content-section">
        <SectionIntro kicker="The question" title="Why count at all">
          The claim is that the Supreme Court makes federal criminal law far more often than the official
          story admits — and that is a claim about frequency, not about any one case.
        </SectionIntro>
        <div className="prose">
          <p>
            Since <em>United States v. Hudson &amp; Goodwin</em>, 11 U.S. (7 Cranch) 32 (1812), the official
            story has been that there are no federal common-law crimes: Congress defines federal offenses and
            courts merely apply what Congress wrote. Testing that story with a handful of famous counterexamples
            proves nothing about how common the practice is. So instead of arguing from examples, we counted.
          </p>
          <p>
            The question this study answers is narrow and answerable: across the Supreme Court’s entire history
            of deciding what federal criminal statutes mean, in how many cases did the Court supply the governing
            rule itself rather than take it from the statutory text? Getting there took three separate jobs.
          </p>
        </div>
        <div className="step-grid">
          <article><span>Step 1</span><h3>Decide which cases count</h3><p>Build a defensible list of every Supreme Court decision resolving a question of substantive federal criminal liability.</p></article>
          <article><span>Step 2</span><h3>Decide what is being counted</h3><p>Write a codebook that defines every label a reader is allowed to apply, with examples and tie-breaking rules.</p></article>
          <article><span>Step 3</span><h3>Read every case</h3><p>Code all {headline.cases} twice, independently, with a quotation required for every judgment, and referee the disagreements blind.</p></article>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Step one" title="Building the case list">
          The census is the part of the study that decides what the denominator is — and a denominator chosen
          loosely would make every rate meaningless.
        </SectionIntro>
        <div className="prose">
          <p>
            We could not simply count “criminal cases.” We needed every decision resolving a question of{" "}
            <strong>substantive federal criminal liability</strong>: what conduct a federal crime covers, what
            mental state it requires, who can be held responsible, and what defenses exist.
          </p>
          <p>
            <strong>Finding candidates.</strong> A battery of 28 searches against CourtListener — a free, complete
            database of American judicial opinions — for terms like “indictment,” “18 U.S.C.,” and “Criminal Code.”
            Pooled and de-duplicated, that produced 5,259 candidates. Because searches miss things, we added a
            hand-built list of 186 cases already known to be relevant. A recall test showed the searches alone
            caught 175 of 182 known in-scope cases; the misses were short early opinions — <em>Hudson &amp; Goodwin</em>{" "}
            among them — that happen to use none of the searched vocabulary.
          </p>
          <p>
            <strong>Sorting them.</strong> We wrote an inclusion rubric stating in advance what counts. In: elements
            of federal offenses, mens rea rules, conspiracy and accomplice doctrine, attempt, causation, defenses,
            rule-of-lenity holdings, and the existence of federal common-law crimes. Out, each with a reason
            recorded: criminal procedure, habeas, sentencing, evidence, jurisdiction, state prosecutions, civil
            cases, and database artifacts such as duplicate records and misfiled opinions.
          </p>
          <p>
            Every one of the roughly 5,000 candidates was classified against that rubric. Genuinely hard categories —
            criminal contempt, civil cases construing a criminal statute, territorial crimes, statutory presumptions,
            immunity defenses — were resolved by written rules, and each such case carries a flag recording which
            rule brought it in. That matters: if we later decide criminal contempt should not count, those cases
            come out with a database query rather than a re-reading.
          </p>
        </div>
        <div className="callout">
          <strong>Result: {headline.cases} cases, spanning 1793 to 2026.</strong>
          <p>Every rate on this site uses that number, or a stated subset of it, as its denominator.</p>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Step two" title="The categories">
          The codebook is the study’s dictionary. It went through six revisions as real cases defeated earlier
          versions, and every revision is dated and logged.
        </SectionIntro>
        <h3 className="sub-head">What kind of move did the Court make?</h3>
        <p className="sub-deck">
          This is the central variable, and the one that produces the headline. A case can carry more than one
          label — the Court may make one kind of move on one issue and another elsewhere. For the headline a case
          counts <em>once</em> if it makes any qualifying move.
        </p>
        <div className="def-list">
          {MODE_GLOSSARY.map((row) => (
            <article key={row.label}>
              <strong>{row.label}</strong>
              <p>{row.gloss}</p>
              <small>{row.example}</small>
            </article>
          ))}
        </div>

        <h3 className="sub-head">How much text did the Court have to work with?</h3>
        <p className="sub-deck">
          The difference between interpreting a word and inventing a rule. This field records how big the gap was.
        </p>
        <dl className="def-table">
          {HOOK_GLOSSARY.map(([term, gloss]) => (
            <div key={term}><dt>{term}</dt><dd>{gloss}</dd></div>
          ))}
        </dl>

        <h3 className="sub-head">Did the Court admit it was making law?</h3>
        <p className="sub-deck">
          The article’s rhetorical claim, made measurable. When the Court fills a gap, does it say so?
        </p>
        <dl className="def-table">
          {ACK_GLOSSARY.map(([term, gloss]) => (
            <div key={term}><dt>{term}</dt><dd>{gloss}</dd></div>
          ))}
        </dl>

        <h3 className="sub-head">What materials did the Court use?</h3>
        <div className="prose">
          <p>
            A further set of fields records whether the Court relied on, rejected, or never mentioned the Model
            Penal Code, Blackstone, other treatises, state court decisions, legislative history, and the rule of
            lenity — plus whether the opinion engaged in explicit moral or practical line-drawing.
          </p>
          <p>
            Several fine-grained rules accumulated here, each because a real case forced the question. Citations
            appearing only in <strong>counsel’s arguments</strong> — which the old U.S. Reports printed alongside
            opinions — do not count; that is the lawyers talking, not the Court. Uses in a{" "}
            <strong>concurrence or dissent</strong> do count, but must be labeled as such. And “legislative history”
            was ultimately defined broadly, covering predecessor statutes and later amendments as well as committee
            reports, with each tagged so the narrow definition stays recoverable by filter. That was necessary
            because pre-1940 courts rarely cited committee reports but constantly traced statutory lineage; the
            narrow definition would have flattened the early era to near zero and destroyed any claim about change
            over time.
          </p>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Step three" title="How the cases were read">
          Every judgment in this database is anchored to a quotation, made twice by independent readers, and
          refereed blind where they disagreed.
        </SectionIntro>
        <div className="prose">
          <p>
            <strong>Who read them.</strong> Large language models, each reading the complete text of one case at a
            time. Every reader received exactly two documents: the full case file — all opinions, majority and
            separate — and the current codebook. They were instructed to read nothing else. No searching, no
            outside knowledge, no other cases.
          </p>
          <p>
            <strong>The evidence rule.</strong> This is the single most important discipline in the study. A reader
            cannot simply assert a label. Every coding must return the label, a <em>verbatim quotation</em> from the
            opinion supporting it, a page pincite, and a confidence score. A script then mechanically checks every
            quotation back against the stored opinion text; mismatches are flagged and repaired before anything is
            loaded. There are currently zero unverified-quote markers in the database.
          </p>
          <p>
            <strong>Two independent readers.</strong> All {headline.cases} cases were coded at least twice by
            different models working independently and blind to each other. Not one case rests on a single reading.
          </p>
          <p>
            <strong>A blind referee.</strong> Where the two readers split on something that could move a reported
            number, the case went to a third model acting as referee. The referee saw the case, the codebook, and a
            packet showing the two competing answers labeled only <em>A</em> and <em>B</em> — never which model
            produced which, with the labels shuffled per case. This matters: a referee who knows the source defers
            to the reader it thinks is stronger instead of reading the opinion. The referee also had to find its own
            supporting quotation rather than copy one.
          </p>
          <p>
            <strong>Checking the referee.</strong> Every decision that actually flipped a verdict was re-read by a
            fresh referee, again blind, and again without seeing the first referee’s answer. The two agreed in 52 of
            57. The five disagreements went to a third reader, best two of three.
          </p>
        </div>
        <div className="flow-chart">
          {summary.adjudication_flow.map((row, index: number) => (
            <div key={row.stage}><span>{index + 1}</span><strong>{row.movers}</strong><p>{row.stage}</p><small>{row.rate}% of {headline.cases}</small></div>
          ))}
        </div>
        <div className="callout">
          <strong>Where it all lives</strong>
          <p>
            A single database holding the cases, the full opinion texts, every coding from every run with its
            quotation, and citation links between cases. Because a case may carry conflicting codings, the database
            has a built-in rule for which one wins — refereed answers beat original codings — and all analysis goes
            through that rule rather than anyone re-deriving it by hand. A snapshot was saved before each
            irreversible step, so any result can be traced backward.
          </p>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Step four" title="What came out">
          The headline, and the shape of the change over time.
        </SectionIntro>
        <div className="hero-stats" aria-label="Headline findings">
          <div><strong>{headline.movers}</strong><span>of {headline.cases} cases make at least one common-law-like move</span></div>
          <div><strong>{headline.rate}%</strong><span>of the corpus, under codebook {String(data.meta.codebook)}</span></div>
        </div>
        <div className="prose">
          <p>
            Among those {headline.movers} cases, fewer than one in ten openly admits the choice. The rate by period
            is <strong>U-shaped, not a steady decline</strong> — the early-twentieth-century trough is followed by a
            post-1940 rebound — and the mechanism shifts underneath it, from old soil in the nineteenth century to
            creation after 1900.
          </p>
        </div>
        <div className="robustness-table">
          {summary.by_period.map((row) => (
            <div className="robustness-row" key={row.period}>
              <strong>{row.period}</strong>
              <span>{row.movers}/{row.cases}</span>
              <Bar value={row.rate} tone="rust" />
              <b>{row.rate}%</b>
            </div>
          ))}
        </div>
        <p className="sub-deck">
          These are descriptive comparisons between periods of a constructed corpus, not causal estimates.
          The Change-over-time view breaks the same data down by mode, acknowledgment, and source use.
        </p>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Honest accounting" title="Where the study is weakest">
          These are the real vulnerabilities, stated plainly. They should travel with any number taken from this site.
        </SectionIntro>
        <div className="caveat-grid">
          {CAVEATS.map((row, index) => (
            <article key={row.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{row.title}</h3>
              <p>{row.body}</p>
            </article>
          ))}
        </div>
        <div className="callout">
          <strong>The measurement warning in one line</strong>
          <p>
            On the same {prompt.cases} cases, the same model coded {prompt.anti_overcoding_none_rate}% “none” with a
            cautioning instruction and {prompt.unqualified_prompt_none_rate}% without it.{" "}
            {prompt.headline_flips} verdicts flipped. {prompt.note}
          </p>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro kicker="Next" title="What would make it stronger">
          Roughly ordered by value per unit of effort.
        </SectionIntro>
        <ol className="improve-list">
          {IMPROVEMENTS.map((row) => (
            <li key={row.title}><strong>{row.title}.</strong> {row.body}</li>
          ))}
        </ol>
        <p className="sub-deck">
          The remaining mode-granularity disputes are deliberately left alone unless mode composition becomes
          load-bearing in the argument. They cannot move the headline, and the effort is better spent on the first item.
        </p>
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
          {[["change", "Change over time"], ["hudson", "Hudson genealogy"], ["cases", "Case Atlas"], ["how", "How it works"], ["methods", "Methods"]].map(([id, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>{label}</button>)}
        </nav>
        <div className="header-meta">Data through Aug. 5, 2026</div>
      </header>
      {view === "change" && <ChangeView data={data} />}
      {view === "hudson" && <HudsonView data={data} onOpenCase={openCase} />}
      {view === "cases" && <CasesView data={data} selected={selected} setSelected={setSelected} />}
      {view === "how" && <HowItWorksView data={data} />}
      {view === "methods" && <MethodsView data={data} />}
      <footer><span>Federal Criminal Common Law Atlas</span><p>896 Supreme Court cases · 1789–2026 · Updated Aug. 5, 2026</p></footer>
    </div>
  );
}
