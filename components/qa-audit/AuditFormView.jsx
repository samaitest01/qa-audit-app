import { useEffect, useMemo, useState } from "react";
import { ChevronDown, FolderKanban, Save, Search, X } from "lucide-react";
import { pct, scoreColor, scoreFor } from "../../lib/scoring";
import { STATUSES, STATUS_COLOR } from "./constants";
import Field from "./Field";
import { styles } from "./styles";

export default function AuditFormView({
  domains, items, projects, audits,
  activeAuditId, setActiveAuditId,
  onSave, showToast,
}) {
  const existing = audits.find((a) => a.id === activeAuditId) || null;

  const [projectId, setProjectId] = useState(existing?.projectId || "");
  const [auditee, setAuditee] = useState(existing?.auditee || "");
  const [auditor, setAuditor] = useState(existing?.auditor || "");
  const [date, setDate] = useState(existing?.date || new Date().toISOString().slice(0, 10));
  const [answers, setAnswers] = useState(existing?.answers || {});
  const [openCategory, setOpenCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [saveAttempted, setSaveAttempted] = useState(false);

  // Reload the form fields whenever a different existing audit is opened for
  // editing (activeAuditId changes) — intentionally not reacting to `existing`
  // itself, since that object is a fresh reference on every re-render.
  useEffect(() => {
    if (existing) {
      setProjectId(existing.projectId || "");
      setAuditee(existing.auditee || "");
      setAuditor(existing.auditor || "");
      setDate(existing.date || new Date().toISOString().slice(0, 10));
      setAnswers(existing.answers || {});
    }
  }, [activeAuditId]); // eslint-disable-line

  const project = projects.find((p) => p.id === projectId);
  const missingProject = saveAttempted && !project;
  const missingAuditee = saveAttempted && !auditee.trim();
  const missingAuditor = saveAttempted && !auditor.trim();
  const domainIds = project ? Array.from(new Set(["core", ...(project.domainIds || [])])) : [];

  // Checklist items are grouped by domain, then by category, so the form
  // can render collapsible domain -> category -> item sections.
  const sections = useMemo(() => {
    const groups = [];
    domainIds.forEach((did) => {
      const domain = domains.find((d) => d.id === did);
      if (!domain) return;
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
      groups.push({ domain, categories: byCat });
    });
    return groups;
  }, [domainIds, domains, items]);

  const allItems = useMemo(() => sections.flatMap((s) => s.categories.flatMap((c) => c.items)), [sections]);
  const overallScore = useMemo(() => scoreFor(allItems, answers), [allItems, answers]);
  const answeredCount = allItems.filter((q) => answers[q.id]?.status).length;

  const setAnswer = (id, patch) => setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleSave = async () => {
    setSaveAttempted(true);
    if (!project) {
      showToast("Pick a project first.");
      return;
    }
    if (!auditee.trim() || !auditor.trim()) {
      showToast("Add auditee and auditor before saving.");
      return;
    }
    const incomplete = allItems.find((q) => {
      const answer = answers[q.id] || {};
      return !answer.status || !answer.comment || !answer.comment.trim();
    });
    if (incomplete) {
      showToast("All checklist items require a status and a comment before saving.");
      return;
    }

    try {
      await onSave({
        id: activeAuditId,
        projectId: project.id,
        projectName: project.name,
        client: project.client,
        domainIds,
        auditee,
        auditor,
        date,
        answers,
        score: overallScore,
        answeredCount,
        totalCount: allItems.length,
      });
      startNew();
    } catch (e) {
      showToast(e.message || "Unable to save audit.");
    }
  };

  const startNew = () => {
    setActiveAuditId(null);
    setProjectId("");
    setAuditee("");
    setAuditor("");
    setDate(new Date().toISOString().slice(0, 10));
    setAnswers({});
  };

  // Score ring: a full circle's stroke-dashoffset goes from 0 (100% filled)
  // to its own circumference (0% filled), so we scale by (1 - percentage).
  const ringPct = overallScore === null ? 0 : Math.max(0, Math.min(1, overallScore));
  const circumference = 2 * Math.PI * 30;

  if (projects.length === 0) {
    return (
      <div style={styles.emptyState}>
        <FolderKanban size={28} color="#4a5560" />
        <h2 style={styles.h2}>No projects yet</h2>
        <p style={styles.subtle}>Add a project and assign it one or more domains before starting an audit.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.h1}>{activeAuditId ? "Edit Audit" : "New QA Audit"}</h1>
          <p style={styles.subtle}>Checklist auto-assembles from the project's domain(s) — Core is always included.</p>
        </div>
        <div style={styles.topActions}>
          {activeAuditId && (
            <button className="ghostBtn" onClick={startNew}>
              <X size={14} /> Start new
            </button>
          )}
          <button className="primaryBtn" onClick={handleSave}>
            <Save size={15} /> Save audit
          </button>
        </div>
      </div>

      <div style={styles.metaGrid}>
        <Field label="Project" error={missingProject}>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={missingProject ? { borderColor: "#e08480" } : {}}
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
            ))}
          </select>
        </Field>
        <Field label="Auditee" error={missingAuditee}>
          <input
            placeholder="Person being audited"
            value={auditee}
            onChange={(e) => setAuditee(e.target.value)}
            style={missingAuditee ? { borderColor: "#e08480" } : {}}
          />
        </Field>
        <Field label="Auditor" error={missingAuditor}>
          <input
            placeholder="Person conducting the audit"
            value={auditor}
            onChange={(e) => setAuditor(e.target.value)}
            style={missingAuditor ? { borderColor: "#e08480" } : {}}
          />
        </Field>
        <Field label="Audit date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>

      {project && (
        <div style={styles.domainBadgeRow}>
          {domainIds.map((did) => {
            const d = domains.find((x) => x.id === did);
            return <span key={did} style={styles.domainBadge}>{d?.name || did}</span>;
          })}
        </div>
      )}

      {project && (
        <>
          <div style={styles.scorePanel}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#232d38" strokeWidth="6" />
              <circle
                cx="36" cy="36" r="30" fill="none"
                stroke={scoreColor(overallScore)}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - ringPct)}
                transform="rotate(-90 36 36)"
                style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
              />
            </svg>
            <div>
              <div style={styles.scoreBig}>{pct(overallScore)}</div>
              <div style={styles.subtle}>Weighted score across {domainIds.length} module{domainIds.length !== 1 ? "s" : ""}</div>
            </div>
            <div style={styles.progressWrap}>
              <div style={styles.progressLabel}>{answeredCount} / {allItems.length} items answered</div>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: `${allItems.length ? (answeredCount / allItems.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <div style={styles.searchWrap}>
            <Search size={14} color="#7c8794" />
            <input
              style={styles.searchInput}
              placeholder="Filter checklist items…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {sections.map(({ domain, categories }) => {
            const domainItemsFlat = categories.flatMap((c) => c.items);
            const domainScore = scoreFor(domainItemsFlat, answers);
            const filteredCats = query.trim()
              ? categories
                  .map((c) => ({ ...c, items: c.items.filter((it) => it.item.toLowerCase().includes(query.toLowerCase())) }))
                  .filter((c) => c.items.length)
              : categories;
            if (query.trim() && filteredCats.length === 0) return null;

            return (
              <div key={domain.id} style={{ marginTop: 26 }}>
                <div style={styles.domainSectionHeader}>
                  <span>{domain.name}</span>
                  <span style={{ color: scoreColor(domainScore), fontFamily: "'IBM Plex Mono', monospace" }}>{pct(domainScore)}</span>
                </div>
                {filteredCats.map((cat) => {
                  const catScore = scoreFor(cat.items, answers);
                  const key = `${domain.id}::${cat.category}`;
                  const isOpen = openCategory === key || query.trim().length > 0;
                  return (
                    <div key={key} style={styles.categoryCard}>
                      <button className="categoryHeader" onClick={() => setOpenCategory(isOpen && !query ? null : key)}>
                        <ChevronDown size={16} style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
                        <span style={styles.categoryName}>{cat.category}</span>
                        <span style={styles.categoryCount}>{cat.items.length} items</span>
                        <span style={{ ...styles.categoryScore, color: scoreColor(catScore) }}>{pct(catScore)}</span>
                      </button>
                      {isOpen && (
                        <div style={styles.itemList}>
                          {cat.items.map((q) => (
                            <ChecklistRow
                              key={q.id}
                              q={q}
                              value={answers[q.id]}
                              onChange={(p) => setAnswer(q.id, p)}
                              saveAttempted={saveAttempted}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function ChecklistRow({ q, value, onChange, saveAttempted }) {
  const status = value?.status;
  const comment = value?.comment || "";
  const missingStatus = saveAttempted && !status;
  const missingComment = saveAttempted && !comment.trim();

  return (
    <div style={styles.itemRow}>
      <div style={styles.itemTop}>
        <span className={`typeTag ${q.type === "Mandatory" ? "typeTagMand" : "typeTagOpt"}`}>{q.type}</span>
        <span style={styles.weightTag}>weight {q.weight}</span>
        <span style={styles.itemText}>{q.item}</span>
      </div>
      <div style={styles.itemControls}>
        <div style={{ ...styles.segmented, borderColor: missingStatus ? "#e08480" : undefined }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ status: s })}
              className="statusBtn"
              style={{
                background: status === s ? STATUS_COLOR[s] : "transparent",
                color: status === s ? "#0e1319" : "#aab4bf",
                borderColor: status === s ? STATUS_COLOR[s] : "#2a3440",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <input
            style={{ ...styles.commentInput, borderColor: missingComment ? "#e08480" : styles.commentInput.border }}
            placeholder="Comment (required)"
            value={comment}
            onChange={(e) => onChange({ comment: e.target.value })}
          />
          {(missingStatus || missingComment) && (
            <div style={styles.validationHint}>
              {missingStatus ? "Status is required." : ""} {missingComment ? "Comment is required." : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
