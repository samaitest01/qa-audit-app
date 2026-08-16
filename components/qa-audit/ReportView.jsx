import { AlertTriangle, FileDown, X } from "lucide-react";
import { pct, scoreColor, scoreFor } from "../../lib/scoring";
import { STATUS_COLOR } from "./constants";
import { filterItemsForProjectType, quarterLabel } from "./utils";
import { styles } from "./styles";

export default function ReportView({ audit, items, domains, projects, onBack }) {
  const missing = [];
  if (!audit.auditee?.trim()) missing.push("Auditee");
  if (!audit.auditor?.trim()) missing.push("Auditor");
  if (!audit.answeredCount) missing.push("checklist answers");
  const isIncomplete = missing.length > 0;

  // Mirrors the same Manual/Automation type filter the audit form applied
  // when this audit was taken, so the report doesn't list questions (as
  // unanswered) that were never actually part of the checklist.
  const project = projects.find((p) => p.id === audit.projectId);

  const groups = (audit.domainIds || [])
    .map((did) => {
      const domain = domains.find((d) => d.id === did);
      const domainItems = filterItemsForProjectType(items.filter((it) => it.domainId === did), project?.type);
      const byCat = [];
      domainItems.forEach((it) => {
        let bucket = byCat.find((x) => x.category === it.category);
        if (!bucket) {
          bucket = { category: it.category, items: [] };
          byCat.push(bucket);
        }
        bucket.items.push(it);
      });
      return { domain, categories: byCat };
    })
    .filter((g) => g.domain);

  return (
    <div>
      <div style={styles.topRow} className="noPrint">
        <button className="ghostBtn" onClick={onBack}><X size={14} /> Back</button>
        <button className="primaryBtn" onClick={() => window.print()}><FileDown size={15} /> Print / Save PDF</button>
      </div>
      {isIncomplete && (
        <div style={styles.reportWarning} className="noPrint">
          <AlertTriangle size={15} />
          <span>This audit is missing {missing.join(", ")} — printing now will produce an incomplete report.</span>
        </div>
      )}
      <div style={styles.reportSheet}>
        <div style={styles.reportHeader}>
          <div>
            <div style={styles.reportTitle}>QA Audit Report</div>
            <div style={styles.subtle}>{audit.client} — {audit.projectName}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...styles.scoreBig, color: scoreColor(audit.score) }}>{pct(audit.score)}</div>
            <div style={styles.subtle}>{(audit.domainIds || []).length} modules</div>
          </div>
        </div>
        <div style={styles.reportMetaGrid}>
          <div><b>Auditee:</b> {audit.auditee}</div>
          <div><b>Auditor:</b> {audit.auditor}</div>
          <div><b>Quarter:</b> {quarterLabel(audit.date)}</div>
          <div><b>Coverage:</b> {audit.answeredCount}/{audit.totalCount} items</div>
        </div>
        {groups.length > 0 && (() => {
          const catScores = groups.flatMap(({ domain, categories }) =>
            categories.map((cat) => ({
              key: `${domain.id}::${cat.category}`,
              domain,
              category: cat.category,
              score: scoreFor(cat.items, audit.answers),
            }))
          );
          const total = catScores.reduce((sum, c) => sum + (c.score || 0), 0);
          const r = 46, strokeWidth = 22, gap = 3;
          const circumference = 2 * Math.PI * r;
          let cumulative = 0;
          return (
            <div style={{ marginTop: 22 }}>
              <div style={{ ...styles.reportCatHeader, fontSize: 14, borderBottom: "2px solid #1a1a1a" }}>Score by Category</div>
              <div style={styles.reportPieWrap}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
                  {total === 0 ? (
                    <circle cx="60" cy="60" r={r} fill="none" stroke="#e9e4da" strokeWidth={strokeWidth} />
                  ) : (
                    catScores.map(({ key, score }) => {
                      const segmentRaw = ((score || 0) / total) * circumference;
                      const segment = Math.max(segmentRaw - gap, 0.001);
                      const dashoffset = -cumulative;
                      cumulative += segmentRaw;
                      if (segmentRaw === 0) return null;
                      return (
                        <circle
                          key={key}
                          cx="60" cy="60" r={r} fill="none"
                          stroke={scoreColor(score)}
                          strokeWidth={strokeWidth}
                          strokeDasharray={`${segment} ${circumference - segment}`}
                          strokeDashoffset={dashoffset}
                          transform="rotate(-90 60 60)"
                        />
                      );
                    })
                  )}
                </svg>
                <div style={styles.reportPieLegend}>
                  {groups.map(({ domain, categories }) => (
                    <div key={domain.id}>
                      <div style={styles.reportPieDomainLabel}>{domain.name}</div>
                      {categories.map((cat) => {
                        const score = scoreFor(cat.items, audit.answers);
                        return (
                          <div key={`${domain.id}::${cat.category}`} style={styles.reportPieLegendItem}>
                            <span style={{ ...styles.reportPieSwatch, background: scoreColor(score) }} />
                            <span style={styles.reportPieLabel}>{cat.category}</span>
                            <span style={{ ...styles.reportPieValue, color: scoreColor(score) }}>{pct(score)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
        {groups.map(({ domain, categories }) => {
          // Categories are re-grouped by section (Manual/Automation/Shared)
          // just for display here — a category's section is whatever its
          // items were tagged with (all items in a category share one).
          const bySection = [];
          categories.forEach((cat) => {
            const section = cat.items[0]?.section || "Manual";
            let bucket = bySection.find((s) => s.section === section);
            if (!bucket) {
              bucket = { section, categories: [] };
              bySection.push(bucket);
            }
            bucket.categories.push(cat);
          });
          return (
            <div key={domain.id} style={{ marginTop: 20 }}>
              <div style={{ ...styles.reportCatHeader, fontSize: 14, borderBottom: "2px solid #1a1a1a" }}>{domain.name}</div>
              {bySection.map((sec) => (
                <div key={sec.section} style={{ marginTop: 12 }}>
                  <div style={styles.reportSectionLabel}>{sec.section}</div>
                  {sec.categories.map((cat) => {
                    const catScore = scoreFor(cat.items, audit.answers);
                    return (
                      <div key={cat.category} style={{ marginTop: 10 }}>
                        <div style={styles.reportCatHeader}>
                          <span>{cat.category}</span>
                          <span>{pct(catScore)}</span>
                        </div>
                        {cat.items.map((q) => {
                          const a = audit.answers[q.id];
                          return (
                            <div key={q.id} style={styles.reportRow}>
                              <span style={{ ...styles.reportStatusDot, background: a?.status ? STATUS_COLOR[a.status] : "#3a4552" }} />
                              <span style={styles.reportItemText}>{q.item}</span>
                              <span style={styles.reportStatusText}>{a?.status || "—"}</span>
                              {a?.comment && <span style={styles.reportComment}>{a.comment}</span>}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
