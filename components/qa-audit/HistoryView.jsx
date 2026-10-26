import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, FileDown, History, Search, Trash2 } from "lucide-react";
import { pct, scoreColor } from "../../lib/scoring";
import { auditQuarterLabel, isDraftAudit } from "./utils";
import { styles } from "./styles";
import PhaseMatrixView from "./PhaseMatrixView";

export default function HistoryView({ audits, projects, onOpen, onDelete, onReport, canDelete }) {
  const [confirmId, setConfirmId] = useState(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("list");

  // An audit's projectName is a snapshot from when it was saved, so a later
  // project rename leaves older audits pointing at a name that no longer
  // matches — two audits for the same project can end up showing different
  // labels. Resolve the live name by ID wherever the project still exists
  // (same approach the Dashboard already uses), falling back to the
  // snapshot only if the project's since been deleted.
  const projectNameById = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])), [projects]);
  const resolveProjectName = (a) => projectNameById[a.projectId] || a.projectName || "Untitled";

  const filteredAudits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return audits;
    return audits.filter((a) =>
      [resolveProjectName(a), a.auditee, a.auditor, a.date, auditQuarterLabel(a)].join(" ").toLowerCase().includes(q)
    );
  }, [audits, query, projectNameById]); // eslint-disable-line

  if (audits.length === 0) {
    return (
      <div style={styles.emptyState}>
        <History size={28} color="#4a5560" />
        <h2 style={styles.h2}>No audits recorded yet</h2>
        <p style={styles.subtle}>Every saved audit will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.h1}>Audit History</h1>
          <p style={styles.subtle}>
            {audits.length} audit{audits.length !== 1 ? "s" : ""} recorded.
            {view === "list" && " Switch to By Project to see each project's audits side by side."}
          </p>
        </div>
        <div style={styles.viewToggle}>
          <button type="button" className={`viewToggleBtn ${view === "list" ? "viewToggleBtnActive" : ""}`} onClick={() => setView("list")}>List</button>
          <button type="button" className={`viewToggleBtn ${view === "matrix" ? "viewToggleBtnActive" : ""}`} onClick={() => setView("matrix")}>By Project</button>
        </div>
      </div>

      {view === "matrix" ? (
        <PhaseMatrixView projects={projects} audits={audits} />
      ) : (
        <>
          <div style={{ ...styles.searchWrap, marginTop: 16, maxWidth: 360 }}>
            <Search size={14} color="#7c8794" />
            <input
              style={styles.searchInput}
              placeholder="Search by project, auditee, or auditor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {filteredAudits.length === 0 && (
            <p style={styles.subtle}>No audits match "{query}".</p>
          )}

          <div style={styles.table}>
            <div style={styles.tableHeadRow}>
              <span>Project</span><span>Quarter</span><span>Auditee</span><span>Auditor</span><span>Date</span><span>Score</span><span></span>
            </div>
            {filteredAudits.map((a) => {
              const isDraft = isDraftAudit(a);
              return (
                <div key={a.id} style={styles.tableRow}>
                  <span style={styles.tableProject}>
                    {resolveProjectName(a)}
                    {isDraft && <span style={{ ...styles.coreTag, marginLeft: 8 }}>draft</span>}
                  </span>
                  <span>{auditQuarterLabel(a)}</span>
                  <span>{a.auditee}</span>
                  <span>{a.auditor}</span>
                  <span>{a.date}</span>
                  <span style={{ color: scoreColor(a.score), fontWeight: 600 }}>{pct(a.score)}</span>
                  <span style={styles.rowActions}>
                    <button className="iconBtn" title="Open report" onClick={() => onReport(a)}><FileDown size={14} /></button>
                    <button className="iconBtn" title="Edit" onClick={() => onOpen(a)}><ClipboardList size={14} /></button>
                    {canDelete && (confirmId === a.id
                      ? <button className="iconBtn iconBtnDanger" onClick={() => { onDelete(a.id); setConfirmId(null); }}><CheckCircle2 size={14} /></button>
                      : <button className="iconBtn" onClick={() => setConfirmId(a.id)}><Trash2 size={14} /></button>)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
