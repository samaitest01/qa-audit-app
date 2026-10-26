import { useMemo, useState } from "react";
import { ncCount, pct, scoreColor } from "../../lib/scoring";
import { auditQuarterLabel, auditsByProject } from "./utils";
import { styles } from "./styles";

function inScope(audit, scope) {
  return scope === "all" || auditQuarterLabel(audit) === scope;
}

function pillClass(score) {
  if (score === null || score === undefined) return "";
  if (score >= 0.8) return "pillGreen";
  if (score >= 0.7) return "pillAmber";
  return "pillRed";
}

export default function PhaseMatrixView({ projects, audits }) {
  const [scope, setScope] = useState("all");

  const byProject = useMemo(() => auditsByProject(projects, audits), [projects, audits]);
  const sortedProjects = useMemo(() => [...projects].sort((a, b) => a.name.localeCompare(b.name)), [projects]);
  const maxAudits = Math.max(1, ...sortedProjects.map((p) => (byProject.get(p.id) || []).length));

  // Scope buttons are whatever quarters the audits are actually tagged
  // with, oldest first — not a fixed list, so this keeps working as the
  // program runs through FY-2026 Q1, Q2, Q3… and beyond with no code change.
  const quarters = useMemo(
    () => Array.from(new Set(audits.map(auditQuarterLabel))).sort(),
    [audits]
  );

  const { scopedProjectCount, scopedAuditCount } = useMemo(() => {
    let projCount = 0, auditCount = 0;
    sortedProjects.forEach((p) => {
      const visible = (byProject.get(p.id) || []).filter((a) => inScope(a, scope));
      if (visible.length) projCount++;
      auditCount += visible.length;
    });
    return { scopedProjectCount: projCount, scopedAuditCount: auditCount };
  }, [sortedProjects, byProject, scope]);

  const scopeNote =
    scope === "all"
      ? `${projects.length} projects, ${audits.length} audit${audits.length !== 1 ? "s" : ""} on record.`
      : `${scopedProjectCount} of ${projects.length} projects audited in ${scope} (${scopedAuditCount} audits).`;

  return (
    <div>
      <div style={styles.phaseScopeRow}>
        <span style={styles.phaseScopeLabel}>Scope</span>
        <div style={styles.phaseSeg}>
          <button
            type="button"
            className={`phaseSegBtn ${scope === "all" ? "phaseSegBtnActive" : ""}`}
            onClick={() => setScope("all")}
          >
            All time
          </button>
          {quarters.map((q) => (
            <button
              key={q}
              type="button"
              className={`phaseSegBtn ${scope === q ? "phaseSegBtnActive" : ""}`}
              onClick={() => setScope(q)}
            >
              {q}
            </button>
          ))}
        </div>
        <span style={styles.subtle}>{scopeNote}</span>
      </div>

      <div style={styles.matrixWrap}>
        <div style={styles.matrixScroll}>
          <table style={styles.matrixTable}>
            <thead>
              <tr>
                <th style={styles.matrixTh}>Project</th>
                {Array.from({ length: maxAudits }, (_, i) => (
                  <th key={i} style={{ ...styles.matrixTh, ...styles.matrixThAudit }}>Audit {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((p) => {
                const projectAudits = byProject.get(p.id) || [];
                if (projectAudits.length === 0) {
                  return (
                    <tr key={p.id}>
                      <td style={styles.matrixTd}>
                        <div style={styles.matrixRowProject}>{p.name}</div>
                        <div style={styles.matrixRowClient}>{p.client}</div>
                      </td>
                      <td style={{ ...styles.matrixTd, ...styles.matrixAuditCell, textAlign: "center" }} colSpan={maxAudits}>
                        <span style={styles.matrixPending}>Pending — not yet audited</span>
                      </td>
                    </tr>
                  );
                }
                const visibleCount = projectAudits.filter((a) => inScope(a, scope)).length;
                const rowDim = scope !== "all" && visibleCount === 0;
                return (
                  <tr key={p.id} className={rowDim ? "matrixRowDim" : ""}>
                    <td style={styles.matrixTd}>
                      <div style={styles.matrixRowProject}>{p.name}</div>
                      <div style={styles.matrixRowClient}>{p.client}</div>
                    </td>
                    {Array.from({ length: maxAudits }, (_, i) => {
                      const a = projectAudits[i];
                      if (!a) {
                        return (
                          <td key={i} style={{ ...styles.matrixTd, ...styles.matrixAuditCell }}>
                            <span style={styles.matrixEmpty}>—</span>
                          </td>
                        );
                      }
                      const within = inScope(a, scope);
                      const nc = ncCount(a.answers);
                      return (
                        <td
                          key={i}
                          className={within ? "" : "matrixCellOutOfScope"}
                          style={{ ...styles.matrixTd, ...styles.matrixAuditCell }}
                        >
                          <div className={pillClass(a.score)} style={styles.matrixPill}>
                            <span className="matrixScore" style={{ ...styles.matrixScore, color: scoreColor(a.score) }}>{pct(a.score)}</span>
                            <span style={styles.matrixMeta}>{a.date}</span>
                            {a.score !== null && a.score !== undefined && <span style={styles.matrixNc}>{nc} NC</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.infoCallout}>
        No fixed Phase I–IV columns — each project just has an ordered list of audits, so a project with one audit and one with five sit in the same table.
        The FY-quarter buttons above group by whichever quarter was chosen on each audit (fiscal year runs April–March), not its date — a new quarter's button appears on its own the first time an audit is tagged with it, with every earlier quarter's history staying intact underneath.
      </div>
    </div>
  );
}
