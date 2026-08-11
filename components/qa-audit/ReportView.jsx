import { FileDown, X } from "lucide-react";
import { pct, scoreColor, scoreFor } from "../../lib/scoring";
import { STATUS_COLOR } from "./constants";
import { quarterLabel } from "./utils";
import { styles } from "./styles";

export default function ReportView({ audit, items, domains, onBack }) {
  const groups = (audit.domainIds || [])
    .map((did) => {
      const domain = domains.find((d) => d.id === did);
      const domainItems = items.filter((it) => it.domainId === did);
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
        {groups.map(({ domain, categories }) => (
          <div key={domain.id} style={{ marginTop: 20 }}>
            <div style={{ ...styles.reportCatHeader, fontSize: 14, borderBottom: "2px solid #1a1a1a" }}>{domain.name}</div>
            {categories.map((cat) => {
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
    </div>
  );
}
