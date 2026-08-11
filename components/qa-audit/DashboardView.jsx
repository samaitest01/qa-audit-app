import { Calendar, ClipboardList, FolderKanban, History, Percent, TrendingUp } from "lucide-react";
import { pct, scoreColor } from "../../lib/scoring";
import { groupCounts, quarterLabel } from "./utils";
import { styles } from "./styles";

export default function DashboardView({ audits, projects }) {
  const quarterCounts = groupCounts(audits, (a) => quarterLabel(a.date));

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

  const projectRows = Object.entries(projectStats)
    .map(([name, s]) => ({ name, count: s.count, avgScore: s.scoreCount ? s.scoreSum / s.scoreCount : null }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const quarterRows = Object.entries(quarterCounts).sort(([a], [b]) => a.localeCompare(b));
  const maxQuarterCount = Math.max(1, ...quarterRows.map(([, c]) => c));

  const scoredAudits = audits.filter((a) => a.score !== null && a.score !== undefined);
  const avgScore = scoredAudits.length ? scoredAudits.reduce((sum, a) => sum + a.score, 0) / scoredAudits.length : null;

  const recentAudits = audits.slice(0, 8);

  const stats = [
    { icon: ClipboardList, label: "Total Audits", value: audits.length },
    { icon: FolderKanban, label: "Projects Audited", value: Object.keys(projectStats).length },
    { icon: Percent, label: "Average Score", value: pct(avgScore), color: scoreColor(avgScore) },
    { icon: Calendar, label: "Quarters Tracked", value: quarterRows.length },
  ];

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.h1}>Audit Dashboard</h1>
          <p style={styles.subtle}>Track audits by quarter and project so you can see where your QA program is growing.</p>
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
      </div>

      <div style={styles.sectionSplit}>
        <div style={styles.dashboardSection}>
          <div style={styles.sectionTitleRow}>
            <TrendingUp size={15} color="#7c8794" />
            <span style={styles.sectionTitle}>Audits by Quarter</span>
          </div>
          {quarterRows.length === 0 ? (
            <p style={styles.subtle}>No audits recorded yet.</p>
          ) : (
            <div style={styles.barList}>
              {quarterRows.map(([quarter, count]) => (
                <div key={quarter} style={styles.barRow}>
                  <span style={styles.barLabel}>{quarter}</span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${(count / maxQuarterCount) * 100}%` }} />
                  </div>
                  <span />
                  <span style={styles.barValue}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.dashboardSection}>
          <div style={styles.sectionTitleRow}>
            <FolderKanban size={15} color="#7c8794" />
            <span style={styles.sectionTitle}>Top Audited Projects</span>
          </div>
          {projectRows.length === 0 ? (
            <p style={styles.subtle}>No audits recorded yet.</p>
          ) : (
            <div style={styles.barList}>
              {projectRows.map((row) => (
                <div key={row.name} style={styles.barRow}>
                  <span style={styles.barLabel} title={row.name}>{row.name}</span>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${row.avgScore !== null ? Math.max(0, Math.min(100, row.avgScore * 100)) : 0}%`,
                      }}
                    />
                  </div>
                  <span style={{ ...styles.barScoreBadge, color: scoreColor(row.avgScore) }}>{pct(row.avgScore)}</span>
                  <span style={styles.barValue}>{row.count}</span>
                </div>
              ))}
            </div>
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
              <span>Project</span><span>Quarter</span><span>Auditor</span><span>Date</span><span>Score</span>
            </div>
            {recentAudits.map((a) => (
              <div key={a.id} style={styles.tableRow}>
                <span style={styles.tableProject}>{a.projectName || "Untitled"}</span>
                <span>{quarterLabel(a.date)}</span>
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
