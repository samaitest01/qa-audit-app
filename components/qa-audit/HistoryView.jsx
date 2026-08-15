import { useState } from "react";
import { CheckCircle2, ClipboardList, FileDown, History, Trash2 } from "lucide-react";
import { pct, scoreColor } from "../../lib/scoring";
import { quarterLabel } from "./utils";
import { styles } from "./styles";

export default function HistoryView({ audits, onOpen, onDelete, onReport }) {
  const [confirmId, setConfirmId] = useState(null);

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
      <h1 style={styles.h1}>Audit History</h1>
      <p style={styles.subtle}>{audits.length} audit{audits.length !== 1 ? "s" : ""} recorded.</p>
      <div style={styles.table}>
        <div style={styles.tableHeadRow}>
          <span>Project</span><span>Quarter</span><span>Auditee</span><span>Auditor</span><span>Date</span><span>Score</span><span></span>
        </div>
        {audits.map((a) => {
          const isDraft = (a.totalCount || 0) > (a.answeredCount || 0);
          return (
            <div key={a.id} style={styles.tableRow}>
              <span style={styles.tableProject}>
                {a.projectName || "Untitled"}
                {isDraft && <span style={{ ...styles.coreTag, marginLeft: 8 }}>draft</span>}
              </span>
              <span>{quarterLabel(a.date)}</span>
              <span>{a.auditee}</span>
              <span>{a.auditor}</span>
              <span>{a.date}</span>
              <span style={{ color: scoreColor(a.score), fontWeight: 600 }}>{pct(a.score)}</span>
              <span style={styles.rowActions}>
                <button className="iconBtn" title="Open report" onClick={() => onReport(a)}><FileDown size={14} /></button>
                <button className="iconBtn" title="Edit" onClick={() => onOpen(a)}><ClipboardList size={14} /></button>
                {confirmId === a.id
                  ? <button className="iconBtn iconBtnDanger" onClick={() => { onDelete(a.id); setConfirmId(null); }}><CheckCircle2 size={14} /></button>
                  : <button className="iconBtn" onClick={() => setConfirmId(a.id)}><Trash2 size={14} /></button>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
