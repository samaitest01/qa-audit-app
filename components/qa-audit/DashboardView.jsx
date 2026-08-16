import { useState } from "react";
import { Award, ClipboardList, FolderKanban, History, Percent } from "lucide-react";
import { pct, scoreColor } from "../../lib/scoring";
import { quarterLabel } from "./utils";
import { styles } from "./styles";

const COVERAGE_RING_RADIUS = 22;
const COVERAGE_RING_CIRCUMFERENCE = 2 * Math.PI * COVERAGE_RING_RADIUS;
const RANKED_PROJECTS_LIMIT = 5;
const NOT_AUDITED_PREVIEW_LIMIT = 8;

export default function DashboardView({ audits, projects }) {
  const [showAllNotAudited, setShowAllNotAudited] = useState(false);

  const projectStats = {};
  audits.forEach((a) => {
    const key = a.projectName || "Untitled";
    if (!projectStats[key]) projectStats[key] = { count: 0, scoreSum: 0, scoreCount: 0 };
    projectStats[key].count += 1;
    if (a.score !== null && a.score !== undefined) {
      projectStats[key].scoreSum += a.score;
      projectStats[key].scoreCount += 1;
    }
  });

  // Only projects with at least one scored audit can be ranked by score.
  const scoredProjectRows = Object.entries(projectStats)
    .filter(([, s]) => s.scoreCount > 0)
    .map(([name, s]) => ({ name, avgScore: s.scoreSum / s.scoreCount }));
  const topScorers = [...scoredProjectRows].sort((a, b) => b.avgScore - a.avgScore).slice(0, RANKED_PROJECTS_LIMIT);
  const lowScorers = [...scoredProjectRows].sort((a, b) => a.avgScore - b.avgScore).slice(0, RANKED_PROJECTS_LIMIT);

  const scoredAudits = audits.filter((a) => a.score !== null && a.score !== undefined);
  const avgScore = scoredAudits.length ? scoredAudits.reduce((sum, a) => sum + a.score, 0) / scoredAudits.length : null;

  const recentAudits = audits.slice(0, 8);

  // Coverage: how many of the current projects have at least one audit,
  // vs. how many have never been audited yet.
  const totalProjectCount = projects.length;
  const auditedProjectIds = new Set(
    audits.map((a) => a.projectId).filter((id) => projects.some((p) => p.id === id))
  );
  const auditedProjectCount = auditedProjectIds.size;
  const notAuditedProjects = projects.filter((p) => !auditedProjectIds.has(p.id)).sort((a, b) => a.name.localeCompare(b.name));
  const coverageRatio = totalProjectCount ? auditedProjectCount / totalProjectCount : null;
  const coverageRingFill = coverageRatio === null ? 0 : Math.max(0, Math.min(1, coverageRatio));

  const stats = [
    { icon: ClipboardList, label: "Total Audits", value: audits.length },
    { icon: Percent, label: "Average Score", value: pct(avgScore), color: scoreColor(avgScore) },
  ];

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.h1}>Audit Dashboard</h1>
          <p style={styles.subtle}>Track audit coverage and performance across your QA program.</p>
        </div>
      </div>

      <div style={styles.statRow}>
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={styles.statCard}>
            <div style={styles.statCardIcon}><Icon size={16} color="#e8a33d" /></div>
            <div style={{ ...styles.statCardValue, color: color || "#eef1f4" }}>{value}</div>
            <div style={styles.statCardLabel}>{label}</div>
          </div>
        ))}
        <div style={styles.statCard}>
          <div style={styles.statCardRing}>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r={COVERAGE_RING_RADIUS} fill="none" stroke="#232d38" strokeWidth="6" />
              <circle
                cx="28" cy="28" r={COVERAGE_RING_RADIUS} fill="none"
                stroke="#e8a33d"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={COVERAGE_RING_CIRCUMFERENCE}
                strokeDashoffset={COVERAGE_RING_CIRCUMFERENCE * (1 - coverageRingFill)}
                transform="rotate(-90 28 28)"
              />
            </svg>
            <div>
              <div style={styles.statCardValue}>{pct(coverageRatio)}</div>
              <div style={{ ...styles.statCardLabel, fontSize: 14 }}>{auditedProjectCount}/{totalProjectCount} projects audited</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.sectionSplit}>
        <div style={styles.dashboardSection}>
          <div style={styles.sectionTitleRow}>
            <Award size={15} color="#7c8794" />
            <span style={styles.sectionTitle}>Top &amp; Low Scoring Projects</span>
          </div>
          {scoredProjectRows.length === 0 ? (
            <p style={styles.subtle}>No scored audits yet.</p>
          ) : (
            <>
              <div style={styles.templateCatLabel}>Top scorers</div>
              <div style={styles.barList}>
                {topScorers.map((row) => (
                  <div key={`top-${row.name}`} style={styles.barRow}>
                    <span style={styles.barLabel} title={row.name}>{row.name}</span>
                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.barFill,
                          background: scoreColor(row.avgScore),
                          width: `${Math.max(0, Math.min(100, row.avgScore * 100))}%`,
                        }}
                      />
                    </div>
                    <span style={{ ...styles.barScoreBadge, color: scoreColor(row.avgScore) }}>{pct(row.avgScore)}</span>
                    <span />
                  </div>
                ))}
              </div>

              <div style={{ ...styles.templateCatLabel, marginTop: 16 }}>Needs attention</div>
              <div style={styles.barList}>
                {lowScorers.map((row) => (
                  <div key={`low-${row.name}`} style={styles.barRow}>
                    <span style={styles.barLabel} title={row.name}>{row.name}</span>
                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.barFill,
                          background: scoreColor(row.avgScore),
                          width: `${Math.max(0, Math.min(100, row.avgScore * 100))}%`,
                        }}
                      />
                    </div>
                    <span style={{ ...styles.barScoreBadge, color: scoreColor(row.avgScore) }}>{pct(row.avgScore)}</span>
                    <span />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={styles.dashboardSection}>
          <div style={styles.sectionTitleRow}>
            <FolderKanban size={15} color="#7c8794" />
            <span style={styles.sectionTitle}>Not Yet Audited</span>
          </div>
          {notAuditedProjects.length === 0 ? (
            <p style={styles.subtle}>{totalProjectCount === 0 ? "No projects yet." : "Every project has at least one audit."}</p>
          ) : (
            <>
              <div style={styles.notAuditedHeaderRow}>
                <span />
                <span style={styles.notAuditedHeaderLabel}>Client</span>
              </div>
              <div style={styles.notAuditedList}>
                {(showAllNotAudited ? notAuditedProjects : notAuditedProjects.slice(0, NOT_AUDITED_PREVIEW_LIMIT)).map((p) => (
                  <div key={p.id} style={styles.notAuditedRow}>
                    <span style={{ ...styles.barLabel, flex: 1, minWidth: 0 }} title={p.name}>{p.name}</span>
                    <span style={styles.subtle}>{p.client}</span>
                  </div>
                ))}
              </div>
              {notAuditedProjects.length > NOT_AUDITED_PREVIEW_LIMIT && (
                <button className="linkBtn" style={{ marginTop: 8 }} onClick={() => setShowAllNotAudited((v) => !v)}>
                  {showAllNotAudited ? "Show less" : `+${notAuditedProjects.length - NOT_AUDITED_PREVIEW_LIMIT} more`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={styles.sectionTitleRow}>
          <History size={15} color="#7c8794" />
          <span style={styles.sectionTitle}>Recent Audits</span>
        </div>
        {recentAudits.length === 0 ? (
          <p style={styles.subtle}>No audits recorded yet.</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeadRow}>
              <span>Project</span><span>Quarter</span><span>Auditee</span><span>Auditor</span><span>Date</span><span>Score</span>
            </div>
            {recentAudits.map((a) => (
              <div key={a.id} style={styles.tableRow}>
                <span style={styles.tableProject}>{a.projectName || "Untitled"}</span>
                <span>{quarterLabel(a.date)}</span>
                <span>{a.auditee}</span>
                <span>{a.auditor}</span>
                <span>{a.date}</span>
                <span style={{ color: scoreColor(a.score), fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{pct(a.score)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
