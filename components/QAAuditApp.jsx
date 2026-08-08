import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ClipboardList, History, ChevronDown, Save, Trash2, X, CheckCircle2, Search,
  FileDown, Layers, FolderKanban, Plus, Pencil, ClipboardPaste, KeyRound,
} from "lucide-react";
import { scoreFor, pct, scoreColor } from "../lib/scoring";

const STATUSES = ["Yes", "Partial", "No", "N/A"];
const STATUS_COLOR = { Yes: "#4c9a6a", Partial: "#d1a13f", No: "#c25450", "N/A": "#5b6572" };

async function api(path, options) {
  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request to /api/${path} failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export default function QAAuditApp() {
  const [view, setView] = useState("form");
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [bootTick, setBootTick] = useState(0);

  const [domains, setDomains] = useState([]);
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [audits, setAudits] = useState([]);

  const [activeAuditId, setActiveAuditId] = useState(null);
  const [reportAudit, setReportAudit] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); }, []);

  const reloadAll = useCallback(async () => {
    const data = await api("data");
    setDomains(data.domains);
    setItems(data.items);
    setProjects(data.projects);
    setAudits(data.audits);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setLoadError(null);
    (async () => {
      try {
        await reloadAll();
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) { setLoadError(e.message); setReady(true); }
      }
    })();
    return () => { cancelled = true; };
  }, [bootTick, reloadAll]);

  // ---- domain/template mutations ----
  const addDomain = async (name, description) => {
    const d = await api("domains", { method: "POST", body: JSON.stringify({ name, description }) });
    setDomains((prev) => [...prev, d]);
    return d.id;
  };
  const deleteDomain = async (domainId) => {
    try {
      await api(`domains/${domainId}`, { method: "DELETE" });
      setDomains((prev) => prev.filter((d) => d.id !== domainId));
      setItems((prev) => prev.filter((it) => it.domainId !== domainId));
      showToast("Domain deleted.");
    } catch (e) { showToast(e.message); }
  };
  const addItem = async (domainId, category, item, weight, type) => {
    const raw = await api("items", { method: "POST", body: JSON.stringify({ domainId, category, item, weight, type }) });
    setItems((prev) => [...prev, { id: raw.id, domainId: raw.domain_id, category: raw.category, item: raw.question, weight: raw.weight, type: raw.type }]);
  };
  const bulkImportItems = async (domainId, rows) => {
    const raw = await api("items", { method: "POST", body: JSON.stringify({ domainId, bulk: rows }) });
    const mapped = raw.map((r) => ({ id: r.id, domainId: r.domain_id, category: r.category, item: r.question, weight: r.weight, type: r.type }));
    setItems((prev) => [...prev, ...mapped]);
  };
  const updateItem = async (item) => {
    await api(`items/${item.id}`, { method: "PUT", body: JSON.stringify(item) });
    setItems((prev) => prev.map((it) => (it.id === item.id ? item : it)));
  };
  const deleteItem = async (itemId) => {
    await api(`items/${itemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // ---- project mutations ----
  const saveProject = async (project) => {
    try {
      if (project.id) {
        const p = await api(`projects/${project.id}`, { method: "PUT", body: JSON.stringify(project) });
        setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
      } else {
        const p = await api("projects", { method: "POST", body: JSON.stringify(project) });
        setProjects((prev) => [...prev, p].sort((a, b) => a.name.localeCompare(b.name)));
      }
      showToast("Project saved.");
    } catch (e) { showToast(e.message); }
  };
  const deleteProject = async (id) => {
    await api(`projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast("Project deleted.");
  };

  // ---- audit mutations ----
  const saveAudit = async (record) => {
    try {
      let saved;
      if (record.id) {
        saved = await api(`audits/${record.id}`, { method: "PUT", body: JSON.stringify(record) });
        setAudits((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
      } else {
        saved = await api("audits", { method: "POST", body: JSON.stringify(record) });
        setAudits((prev) => [saved, ...prev]);
      }
      setActiveAuditId(saved.id);
      showToast("Audit saved.");
      return saved;
    } catch (e) {
      showToast(e.message);
      throw e;
    }
  };
  const deleteAudit = async (id) => {
    await api(`audits/${id}`, { method: "DELETE" });
    setAudits((prev) => prev.filter((a) => a.id !== id));
    showToast("Audit deleted.");
  };

  if (!ready) {
    return (
      <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", display: "flex" }}>
        <style>{css}</style>
        <div style={{ textAlign: "center" }}><div className="spinner" /><div style={{ ...styles.subtle, marginTop: 12 }}>Loading…</div></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", display: "flex" }}>
        <style>{css}</style>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h2 style={styles.h2}>Couldn't load data</h2>
          <p style={styles.subtle}>{loadError}</p>
          <p style={styles.subtle}>Check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly and the schema has been run.</p>
          <button className="primaryBtn" style={{ margin: "16px auto 0" }} onClick={() => setBootTick((t) => t + 1)}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <style>{css}</style>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>QA</div>
          <div><div style={styles.brandTitle}>Audit Console</div><div style={styles.brandSub}>Multi-domain QA program</div></div>
        </div>
        <nav style={styles.nav}>
          <button className={`navBtn ${view === "form" ? "navBtnActive" : ""}`} onClick={() => setView("form")}><ClipboardList size={16} /> New / Edit Audit</button>
          <button className={`navBtn ${view === "history" ? "navBtnActive" : ""}`} onClick={() => setView("history")}><History size={16} /> Audit History</button>
          <button className={`navBtn ${view === "projects" ? "navBtnActive" : ""}`} onClick={() => setView("projects")}><FolderKanban size={16} /> Projects</button>
          <button className={`navBtn ${view === "templates" ? "navBtnActive" : ""}`} onClick={() => setView("templates")}><Layers size={16} /> Domains & Templates</button>
          <button className={`navBtn ${view === "password" ? "navBtnActive" : ""}`} onClick={() => setView("password")}><KeyRound size={16} /> Change Password</button>
        </nav>
        <div style={styles.sideStat}>
          <div style={styles.sideStatLabel}>Projects · Audits</div>
          <div style={styles.sideStatValue}>{projects.length} · {audits.length}</div>
        </div>
        <button className="ghostBtn" style={{ marginTop: "auto" }} onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}>
          Log out
        </button>
      </aside>

      <main style={styles.main}>
        {view === "form" && (
          <AuditFormView
            domains={domains} items={items} projects={projects} audits={audits}
            activeAuditId={activeAuditId} setActiveAuditId={setActiveAuditId}
            onSave={saveAudit} showToast={showToast}
          />
        )}
        {view === "history" && (
          <HistoryView
            audits={audits}
            onOpen={(a) => { setActiveAuditId(a.id); setView("form"); }}
            onDelete={deleteAudit}
            onReport={(a) => { setReportAudit(a); setView("report"); }}
          />
        )}
        {view === "report" && reportAudit && (
          <ReportView audit={reportAudit} items={items} domains={domains} onBack={() => setView("history")} />
        )}
        {view === "projects" && (
          <ProjectsView projects={projects} domains={domains} onSave={saveProject} onDelete={deleteProject} />
        )}
        {view === "templates" && (
          <TemplatesView
            domains={domains} items={items}
            onAddDomain={addDomain} onDeleteDomain={deleteDomain}
            onAddItem={addItem} onBulkImport={bulkImportItems} onUpdateItem={updateItem} onDeleteItem={deleteItem}
          />
        )}
        {view === "password" && <ChangePasswordView showToast={showToast} />}
      </main>
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

// ===========================================================================
function AuditFormView({ domains, items, projects, audits, activeAuditId, setActiveAuditId, onSave, showToast }) {
  const existing = audits.find((a) => a.id === activeAuditId) || null;
  const [projectId, setProjectId] = useState(existing?.projectId || "");
  const [auditee, setAuditee] = useState(existing?.auditee || "");
  const [auditor, setAuditor] = useState(existing?.auditor || "");
  const [date, setDate] = useState(existing?.date || new Date().toISOString().slice(0, 10));
  const [answers, setAnswers] = useState(existing?.answers || {});
  const [openCategory, setOpenCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [saveAttempted, setSaveAttempted] = useState(false);

  useEffect(() => {
    if (existing) {
      setProjectId(existing.projectId || ""); setAuditee(existing.auditee || ""); setAuditor(existing.auditor || "");
      setDate(existing.date || new Date().toISOString().slice(0, 10)); setAnswers(existing.answers || {});
    }
  }, [activeAuditId]); // eslint-disable-line

  const project = projects.find((p) => p.id === projectId);
  const missingProject = saveAttempted && !project;
  const missingAuditee = saveAttempted && !auditee.trim();
  const missingAuditor = saveAttempted && !auditor.trim();
  const domainIds = project ? Array.from(new Set(["core", ...(project.domainIds || [])])) : [];

  const sections = useMemo(() => {
    const groups = [];
    domainIds.forEach((did) => {
      const domain = domains.find((d) => d.id === did);
      if (!domain) return;
      const domainItems = items.filter((it) => it.domainId === did);
      const byCat = [];
      domainItems.forEach((it) => {
        let b = byCat.find((x) => x.category === it.category);
        if (!b) { b = { category: it.category, items: [] }; byCat.push(b); }
        b.items.push(it);
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
    if (!project) { showToast("Pick a project first."); return; }
    if (!auditee.trim() || !auditor.trim()) { showToast("Add auditee and auditor before saving."); return; }
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
        projectId: project.id, projectName: project.name, client: project.client, domainIds,
        auditee, auditor, date, answers,
        score: overallScore, answeredCount, totalCount: allItems.length,
      });
      startNew();
    } catch (e) {
      showToast(e.message || "Unable to save audit.");
    }
  };

  const startNew = () => {
    setActiveAuditId(null); setProjectId(""); setAuditee(""); setAuditor("");
    setDate(new Date().toISOString().slice(0, 10)); setAnswers({});
  };

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
          {activeAuditId && <button className="ghostBtn" onClick={startNew}><X size={14} /> Start new</button>}
          <button className="primaryBtn" onClick={handleSave}><Save size={15} /> Save audit</button>
        </div>
      </div>

      <div style={styles.metaGrid}>
        <Field label="Project" error={missingProject}>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={missingProject ? { borderColor: "#e08480" } : {}}>
            <option value="">Select a project…</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.client})</option>)}
          </select>
        </Field>
        <Field label="Auditee" error={missingAuditee}><input placeholder="Person being audited" value={auditee} onChange={(e) => setAuditee(e.target.value)} style={missingAuditee ? { borderColor: "#e08480" } : {}} /></Field>
        <Field label="Auditor" error={missingAuditor}><input placeholder="Person conducting the audit" value={auditor} onChange={(e) => setAuditor(e.target.value)} style={missingAuditor ? { borderColor: "#e08480" } : {}} /></Field>
        <Field label="Audit date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      </div>

      {project && (
        <div style={styles.domainBadgeRow}>
          {domainIds.map((did) => { const d = domains.find((x) => x.id === did); return <span key={did} style={styles.domainBadge}>{d?.name || did}</span>; })}
        </div>
      )}

      {project && (
        <>
          <div style={styles.scorePanel}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#232d38" strokeWidth="6" />
              <circle cx="36" cy="36" r="30" fill="none" stroke={scoreColor(overallScore)} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ringPct)} transform="rotate(-90 36 36)"
                style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }} />
            </svg>
            <div>
              <div style={styles.scoreBig}>{pct(overallScore)}</div>
              <div style={styles.subtle}>Weighted score across {domainIds.length} module{domainIds.length !== 1 ? "s" : ""}</div>
            </div>
            <div style={styles.progressWrap}>
              <div style={styles.progressLabel}>{answeredCount} / {allItems.length} items answered</div>
              <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${allItems.length ? (answeredCount / allItems.length) * 100 : 0}%` }} /></div>
            </div>
          </div>

          <div style={styles.searchWrap}>
            <Search size={14} color="#7c8794" />
            <input style={styles.searchInput} placeholder="Filter checklist items…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {sections.map(({ domain, categories }) => {
            const domainItemsFlat = categories.flatMap((c) => c.items);
            const domainScore = scoreFor(domainItemsFlat, answers);
            const filteredCats = query.trim()
              ? categories.map((c) => ({ ...c, items: c.items.filter((it) => it.item.toLowerCase().includes(query.toLowerCase())) })).filter((c) => c.items.length)
              : categories;
            if (query.trim() && filteredCats.length === 0) return null;
            return (
              <div key={domain.id} style={{ marginTop: 26 }}>
                <div style={styles.domainSectionHeader}><span>{domain.name}</span><span style={{ color: scoreColor(domainScore), fontFamily: "'IBM Plex Mono', monospace" }}>{pct(domainScore)}</span></div>
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
                          {cat.items.map((q) => <ChecklistRow key={q.id} q={q} value={answers[q.id]} onChange={(p) => setAnswer(q.id, p)} saveAttempted={saveAttempted} />)}
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
            <button key={s} onClick={() => onChange({ status: s })} className="statusBtn"
              style={{ background: status === s ? STATUS_COLOR[s] : "transparent", color: status === s ? "#0e1319" : "#aab4bf", borderColor: status === s ? STATUS_COLOR[s] : "#2a3440" }}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <input style={{ ...styles.commentInput, borderColor: missingComment ? "#e08480" : styles.commentInput.border }} placeholder="Comment (required)" value={comment} onChange={(e) => onChange({ comment: e.target.value })} />
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

function Field({ label, children, error }) { return <label style={styles.field}><span style={{ ...styles.fieldLabel, color: error ? "#e08480" : undefined }}>{label}</span>{children}</label>; }

// ===========================================================================
function ChangePasswordView({ showToast }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) { showToast("New passwords don't match."); return; }
    setBusy(true);
    try {
      await api("auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword: current, newPassword: next }) });
      showToast("Password changed. Everyone will need to log in again with the new one.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (e) {
      showToast(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 style={styles.h1}>Change Password</h1>
      <p style={styles.subtle}>This changes the shared password everyone on the team uses to get in.</p>
      <form onSubmit={submit} style={{ ...styles.editorPanel, maxWidth: 360 }}>
        <Field label="Current password"><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
        <div style={{ height: 12 }} />
        <Field label="New password"><input type="password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <div style={{ height: 12 }} />
        <Field label="Confirm new password"><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
        <button type="submit" className="primaryBtn" disabled={busy} style={{ marginTop: 16 }}>{busy ? "Saving…" : "Change password"}</button>
      </form>
    </div>
  );
}

function ProjectsView({ projects, domains, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  return (
    <div>
      <div style={styles.topRow}>
        <div><h1 style={styles.h1}>Projects</h1><p style={styles.subtle}>{projects.length} project{projects.length !== 1 ? "s" : ""}. Each holds one or more domains, which decide its audit checklist.</p></div>
        <button className="primaryBtn" onClick={() => setEditing({ name: "", client: "", domainIds: [] })}><Plus size={15} /> New project</button>
      </div>
      {editing && <ProjectEditor project={editing} domains={domains} onCancel={() => setEditing(null)} onSave={(p) => { onSave(p); setEditing(null); }} />}
      <div style={styles.cardGrid}>
        {projects.map((p) => (
          <div key={p.id} style={styles.projectCard}>
            <div style={styles.projectCardTop}>
              <div><div style={styles.projectName}>{p.name}</div><div style={styles.subtle}>{p.client}</div></div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="iconBtn" onClick={() => setEditing(p)}><Pencil size={14} /></button>
                {confirmId === p.id ? (
                  <button className="iconBtn iconBtnDanger" title="Confirm delete — this also deletes its audit history" onClick={() => { onDelete(p.id); setConfirmId(null); }}><CheckCircle2 size={14} /></button>
                ) : (
                  <button className="iconBtn iconBtnDanger" title="Delete" onClick={() => setConfirmId(p.id)}><Trash2 size={14} /></button>
                )}
              </div>
            </div>
            <div style={styles.domainBadgeRow}>
              {(p.domainIds || []).map((did) => { const d = domains.find((x) => x.id === did); return <span key={did} style={styles.domainBadge}>{d?.name || did}</span>; })}
              {(p.domainIds || []).length === 0 && <span style={styles.subtle}>No domain assigned yet</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectEditor({ project, domains, onCancel, onSave }) {
  const [name, setName] = useState(project.name || "");
  const [client, setClient] = useState(project.client || "");
  const [domainIds, setDomainIds] = useState(project.domainIds || []);
  const assignable = domains.filter((d) => !d.builtin);
  const toggle = (id) => setDomainIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  return (
    <div style={styles.editorPanel}>
      <div style={styles.metaGrid}>
        <Field label="Project name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FleetTrack Telematics" /></Field>
        <Field label="Client"><input value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Pentana Solutions" /></Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={styles.fieldLabel}>Domain(s) — Core is always included automatically</div>
        <div style={styles.checkGrid}>
          {assignable.map((d) => (
            <label key={d.id} className="checkPill" style={{ background: domainIds.includes(d.id) ? "#2a2117" : "transparent", borderColor: domainIds.includes(d.id) ? "#e8a33d" : "#2a3440" }}>
              <input type="checkbox" checked={domainIds.includes(d.id)} onChange={() => toggle(d.id)} style={{ width: "auto" }} /> {d.name}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button className="primaryBtn" onClick={() => { if (name.trim()) onSave({ ...project, name: name.trim(), client: client.trim(), domainIds }); }}>Save project</button>
        <button className="ghostBtn" onClick={onCancel}><X size={14} /> Cancel</button>
      </div>
    </div>
  );
}

// ===========================================================================
function TemplatesView({ domains, items, onAddDomain, onDeleteDomain, onAddItem, onBulkImport, onUpdateItem, onDeleteItem }) {
  const [openDomain, setOpenDomain] = useState(null);
  const [newDomain, setNewDomain] = useState(null);
  const [confirmDomainId, setConfirmDomainId] = useState(null);
  return (
    <div>
      <div style={styles.topRow}>
        <div><h1 style={styles.h1}>Domains & Templates</h1><p style={styles.subtle}>Add domains and edit checklist items — changes apply to every future audit.</p></div>
        <button className="primaryBtn" onClick={() => setNewDomain({ name: "", description: "" })}><Plus size={15} /> New domain</button>
      </div>
      {newDomain && (
        <div style={styles.editorPanel}>
          <div style={styles.metaGrid}>
            <Field label="Domain name"><input value={newDomain.name} onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })} placeholder="e.g. Medical Devices" /></Field>
            <Field label="Description"><input value={newDomain.description} onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })} placeholder="One line describing this domain" /></Field>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="primaryBtn" onClick={async () => { if (newDomain.name.trim()) { const id = await onAddDomain(newDomain.name.trim(), newDomain.description.trim()); setNewDomain(null); setOpenDomain(id); } }}>Create domain</button>
            <button className="ghostBtn" onClick={() => setNewDomain(null)}><X size={14} /> Cancel</button>
          </div>
        </div>
      )}
      {domains.map((d) => {
        const domainItems = items.filter((it) => it.domainId === d.id);
        const isOpen = openDomain === d.id;
        return (
          <div key={d.id} style={styles.categoryCard}>
            <button className="categoryHeader" onClick={() => setOpenDomain(isOpen ? null : d.id)}>
              <ChevronDown size={16} style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
              <span style={styles.categoryName}>{d.name}{d.builtin && <span style={styles.coreTag}>core</span>}</span>
              <span style={styles.categoryCount}>{domainItems.length} items</span>
              {!d.builtin && (
                confirmDomainId === d.id ? (
                  <button className="iconBtn iconBtnDanger" title="Confirm delete — removes all its items too" onClick={(e) => { e.stopPropagation(); onDeleteDomain(d.id); setConfirmDomainId(null); }}><CheckCircle2 size={13} /></button>
                ) : (
                  <button className="iconBtn iconBtnDanger" title="Delete" onClick={(e) => { e.stopPropagation(); setConfirmDomainId(d.id); }}><Trash2 size={13} /></button>
                )
              )}
            </button>
            {isOpen && (
              <div style={{ padding: "4px 18px 18px" }}>
                <p style={styles.subtle}>{d.description}</p>
                <TemplateEditor domainId={d.id} items={domainItems} onAddItem={onAddItem} onBulkImport={onBulkImport} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function parseBulkRows(text) {
  return text.split("\n").map((l) => l.replace(/\r$/, "")).filter((l) => l.trim().length > 0).map((line) => {
    const cols = line.includes("\t") ? line.split("\t") : line.split(",");
    const category = (cols[0] || "").trim();
    const item = (cols[1] || "").trim();
    let weight = parseInt((cols[2] || "").trim(), 10);
    if (!weight || weight < 1 || weight > 5) weight = 3;
    let type = (cols[3] || "").trim();
    type = /optional/i.test(type) ? "Optional" : "Mandatory";
    return { category, item, weight, type };
  }).filter((r) => r.category && r.item);
}

function TemplateEditor({ domainId, items, onAddItem, onBulkImport, onUpdateItem, onDeleteItem }) {
  const [draft, setDraft] = useState({ category: "", item: "", weight: 3, type: "Mandatory" });
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const byCat = [];
  items.forEach((it) => { let b = byCat.find((x) => x.category === it.category); if (!b) { b = { category: it.category, items: [] }; byCat.push(b); } b.items.push(it); });
  const parsedRows = bulkOpen ? parseBulkRows(bulkText) : [];

  return (
    <div>
      {byCat.map((c) => (
        <div key={c.category} style={{ marginTop: 12 }}>
          <div style={styles.templateCatLabel}>{c.category}</div>
          {c.items.map((it) => <TemplateRow key={it.id} item={it} onUpdate={onUpdateItem} onDelete={onDeleteItem} />)}
        </div>
      ))}
      <div style={styles.addItemRow}>
        <input placeholder="Category" style={{ width: 160 }} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
        <input placeholder="Checklist question…" style={{ flex: 1 }} value={draft.item} onChange={(e) => setDraft({ ...draft, item: e.target.value })} />
        <input type="number" min={1} max={5} style={{ width: 60 }} value={draft.weight} onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) })} />
        <select style={{ width: 110 }} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}><option>Mandatory</option><option>Optional</option></select>
        <button className="iconBtn" title="Add item" onClick={() => { if (draft.category.trim() && draft.item.trim()) { onAddItem(domainId, draft.category.trim(), draft.item.trim(), draft.weight, draft.type); setDraft({ category: draft.category, item: "", weight: 3, type: "Mandatory" }); } }}><Plus size={14} /></button>
      </div>
      <button className="ghostBtn" style={{ marginTop: 10 }} onClick={() => setBulkOpen((v) => !v)}><ClipboardPaste size={14} /> {bulkOpen ? "Hide bulk import" : "Bulk import from a question bank"}</button>
      {bulkOpen && (
        <div style={styles.bulkPanel}>
          <p style={styles.subtle}>Paste rows copied from Excel/Sheets: <b>Category</b>, <b>Question</b>, <b>Weight (1-5, optional)</b>, <b>Mandatory/Optional (optional)</b>. Tab- or comma-separated, one question per line.</p>
          <textarea style={styles.bulkTextarea} value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={6}
            placeholder={"Connectivity & Protocols\tBluetooth pairing is tested across all supported devices.\t4\tMandatory"} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <button className="primaryBtn" disabled={parsedRows.length === 0} onClick={async () => { await onBulkImport(domainId, parsedRows); setBulkText(""); setBulkOpen(false); }}>
              <Plus size={15} /> Import {parsedRows.length} item{parsedRows.length !== 1 ? "s" : ""}
            </button>
            {bulkText.trim() && parsedRows.length === 0 && <span style={{ color: "#e08480", fontSize: 12.5 }}>No valid rows detected.</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateRow({ item, onUpdate, onDelete }) {
  return (
    <div style={styles.templateRow}>
      <span style={styles.templateItemText}>{item.item}</span>
      <select value={item.weight} onChange={(e) => onUpdate({ ...item, weight: Number(e.target.value) })} style={{ width: 56 }}>{[1, 2, 3, 4, 5].map((w) => <option key={w} value={w}>{w}</option>)}</select>
      <select value={item.type} onChange={(e) => onUpdate({ ...item, type: e.target.value })} style={{ width: 100 }}><option>Mandatory</option><option>Optional</option></select>
      <button className="iconBtn iconBtnDanger" onClick={() => onDelete(item.id)}><Trash2 size={13} /></button>
    </div>
  );
}

// ===========================================================================
function HistoryView({ audits, onOpen, onDelete, onReport }) {
  const [confirmId, setConfirmId] = useState(null);
  if (audits.length === 0) return <div style={styles.emptyState}><History size={28} color="#4a5560" /><h2 style={styles.h2}>No audits recorded yet</h2><p style={styles.subtle}>Every saved audit will show up here.</p></div>;
  return (
    <div>
      <h1 style={styles.h1}>Audit History</h1>
      <p style={styles.subtle}>{audits.length} audit{audits.length !== 1 ? "s" : ""} recorded.</p>
      <div style={styles.table}>
        <div style={styles.tableHeadRow}><span>Project</span><span>Auditee</span><span>Auditor</span><span>Date</span><span>Score</span><span></span></div>
        {audits.map((a) => (
          <div key={a.id} style={styles.tableRow}>
            <span style={styles.tableProject}>{a.projectName || "Untitled"}</span><span>{a.auditee}</span><span>{a.auditor}</span><span>{a.date}</span>
            <span style={{ color: scoreColor(a.score), fontWeight: 600 }}>{pct(a.score)}</span>
            <span style={styles.rowActions}>
              <button className="iconBtn" title="Open report" onClick={() => onReport(a)}><FileDown size={14} /></button>
              <button className="iconBtn" title="Edit" onClick={() => onOpen(a)}><ClipboardList size={14} /></button>
              {confirmId === a.id
                ? <button className="iconBtn iconBtnDanger" onClick={() => { onDelete(a.id); setConfirmId(null); }}><CheckCircle2 size={14} /></button>
                : <button className="iconBtn" onClick={() => setConfirmId(a.id)}><Trash2 size={14} /></button>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
function ReportView({ audit, items, domains, onBack }) {
  const groups = (audit.domainIds || []).map((did) => {
    const domain = domains.find((d) => d.id === did);
    const domainItems = items.filter((it) => it.domainId === did);
    const byCat = [];
    domainItems.forEach((it) => { let b = byCat.find((x) => x.category === it.category); if (!b) { b = { category: it.category, items: [] }; byCat.push(b); } b.items.push(it); });
    return { domain, categories: byCat };
  }).filter((g) => g.domain);

  return (
    <div>
      <div style={styles.topRow} className="noPrint">
        <button className="ghostBtn" onClick={onBack}><X size={14} /> Back</button>
        <button className="primaryBtn" onClick={() => window.print()}><FileDown size={15} /> Print / Save PDF</button>
      </div>
      <div style={styles.reportSheet}>
        <div style={styles.reportHeader}>
          <div><div style={styles.reportTitle}>QA Audit Report</div><div style={styles.subtle}>{audit.client} — {audit.projectName}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ ...styles.scoreBig, color: scoreColor(audit.score) }}>{pct(audit.score)}</div><div style={styles.subtle}>{(audit.domainIds || []).length} modules</div></div>
        </div>
        <div style={styles.reportMetaGrid}>
          <div><b>Auditee:</b> {audit.auditee}</div><div><b>Auditor:</b> {audit.auditor}</div>
          <div><b>Date:</b> {audit.date}</div><div><b>Coverage:</b> {audit.answeredCount}/{audit.totalCount} items</div>
        </div>
        {groups.map(({ domain, categories }) => (
          <div key={domain.id} style={{ marginTop: 20 }}>
            <div style={{ ...styles.reportCatHeader, fontSize: 14, borderBottom: "2px solid #1a1a1a" }}>{domain.name}</div>
            {categories.map((cat) => {
              const catScore = scoreFor(cat.items, audit.answers);
              return (
                <div key={cat.category} style={{ marginTop: 10 }}>
                  <div style={styles.reportCatHeader}><span>{cat.category}</span><span>{pct(catScore)}</span></div>
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

// ===========================================================================
const styles = {
  app: { display: "flex", minHeight: "100vh", background: "#0e1319", color: "#eef1f4", fontFamily: "'Inter', system-ui, sans-serif" },
  sidebar: { width: 240, background: "#12181f", borderRight: "1px solid #1f2933", padding: "22px 16px", display: "flex", flexDirection: "column", gap: 22, flexShrink: 0 },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandMark: { width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#e8a33d,#c97a2e)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, color: "#12181f" },
  brandTitle: { fontWeight: 600, fontSize: 14 },
  brandSub: { fontSize: 11.5, color: "#7c8794" },
  nav: { display: "flex", flexDirection: "column", gap: 4 },
  sideStat: { background: "#171f28", border: "1px solid #232d38", borderRadius: 10, padding: "12px 14px" },
  sideStatLabel: { fontSize: 11, color: "#7c8794", textTransform: "uppercase", letterSpacing: 0.5 },
  sideStatValue: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, marginTop: 2 },
  main: { flex: 1, padding: "30px 40px 60px", maxWidth: 980, overflowY: "auto" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 18 },
  topActions: { display: "flex", gap: 8 },
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, margin: 0 },
  h2: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: "10px 0 4px" },
  subtle: { color: "#8b96a3", fontSize: 13, margin: "4px 0 0" },
  metaGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 4 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 11.5, color: "#7c8794", textTransform: "uppercase", letterSpacing: 0.4 },
  segmented: { display: "flex", gap: 6, flexWrap: "wrap" },
  scorePanel: { display: "flex", alignItems: "center", gap: 20, background: "#171f28", border: "1px solid #232d38", borderRadius: 14, padding: "18px 22px", marginTop: 22 },
  scoreBig: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 30, fontWeight: 700 },
  progressWrap: { flex: 1, marginLeft: 10 },
  progressLabel: { fontSize: 12, color: "#8b96a3", marginBottom: 6 },
  progressTrack: { height: 6, borderRadius: 99, background: "#232d38", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#e8a33d,#c97a2e)", borderRadius: 99, transition: "width 0.3s ease" },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "#171f28", border: "1px solid #232d38", borderRadius: 10, padding: "9px 12px", marginTop: 22 },
  searchInput: { background: "transparent", border: "none", outline: "none", color: "#eef1f4", fontSize: 13, width: "100%" },
  domainSectionHeader: { display: "flex", justifyContent: "space-between", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, padding: "0 4px 8px", borderBottom: "1px solid #1f2933" },
  categoryCard: { border: "1px solid #1f2933", borderRadius: 12, marginTop: 12, overflow: "hidden", background: "#12181f" },
  categoryName: { fontWeight: 600, fontSize: 13.5, flex: 1, textAlign: "left", display: "flex", alignItems: "center", gap: 8 },
  categoryCount: { fontSize: 11.5, color: "#7c8794", marginRight: 14 },
  categoryScore: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600 },
  coreTag: { fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", background: "rgba(232,163,61,0.18)", color: "#e8a33d", padding: "2px 6px", borderRadius: 5 },
  itemList: { borderTop: "1px solid #1f2933" },
  itemRow: { padding: "14px 18px", borderBottom: "1px solid #171f28" },
  itemTop: { display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  itemText: { fontSize: 13.5, color: "#dbe1e6" },
  weightTag: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#7c8794" },
  itemControls: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  commentInput: { flex: 1, minWidth: 200, background: "#171f28", border: "1px solid #232d38", borderRadius: 8, padding: "7px 10px", color: "#eef1f4", fontSize: 12.5, outline: "none" },
  validationHint: { marginTop: 6, color: "#e08480", fontSize: 11, lineHeight: 1.3 },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1c242e", border: "1px solid #2c3742", color: "#eef1f4", padding: "10px 18px", borderRadius: 10, fontSize: 13 },
  emptyState: { textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  table: { marginTop: 18, border: "1px solid #1f2933", borderRadius: 12, overflow: "hidden" },
  tableHeadRow: { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 0.9fr 0.7fr 0.9fr", padding: "10px 16px", background: "#171f28", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, color: "#7c8794" },
  tableRow: { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 0.9fr 0.7fr 0.9fr", padding: "12px 16px", borderTop: "1px solid #1a222c", fontSize: 13, alignItems: "center" },
  tableProject: { fontWeight: 600 },
  rowActions: { display: "flex", gap: 6, justifyContent: "flex-end" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginTop: 20 },
  projectCard: { border: "1px solid #1f2933", borderRadius: 12, padding: 16, background: "#12181f" },
  projectCardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  projectName: { fontWeight: 600, fontSize: 14.5 },
  domainBadgeRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 },
  domainBadge: { fontSize: 11, background: "#1d2632", color: "#c9b28a", padding: "3px 9px", borderRadius: 99, border: "1px solid #2a3440" },
  editorPanel: { border: "1px solid #2a3440", background: "#141b23", borderRadius: 12, padding: 18, marginTop: 6, marginBottom: 20 },
  checkGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  templateCatLabel: { fontSize: 11.5, color: "#7c8794", textTransform: "uppercase", letterSpacing: 0.4, margin: "10px 0 6px" },
  templateRow: { display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #171f28" },
  templateItemText: { flex: 1, fontSize: 13 },
  addItemRow: { display: "flex", gap: 8, marginTop: 14, alignItems: "center" },
  bulkPanel: { border: "1px solid #2a3440", background: "#141b23", borderRadius: 10, padding: 14, marginTop: 10 },
  bulkTextarea: { width: "100%", background: "#0e1319", border: "1px solid #232d38", borderRadius: 8, padding: 10, color: "#eef1f4", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", outline: "none", resize: "vertical", boxSizing: "border-box" },
  reportSheet: { background: "#fdfcfa", color: "#1a1a1a", borderRadius: 12, padding: "36px 40px", marginTop: 18 },
  reportHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1a1a1a", paddingBottom: 14 },
  reportTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 700 },
  reportMetaGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontSize: 12.5, marginTop: 14, color: "#333" },
  reportCatHeader: { display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" },
  reportRow: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12.5 },
  reportStatusDot: { width: 7, height: 7, borderRadius: 99, flexShrink: 0 },
  reportItemText: { flex: 1 },
  reportStatusText: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, width: 60, textAlign: "right" },
  reportComment: { fontSize: 11, color: "#666", fontStyle: "italic", width: 200, textAlign: "left" },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600;700&display=swap');
.navBtn { display:flex; align-items:center; gap:9px; padding:9px 12px; border-radius:9px; border:none; background:transparent; color:#aab4bf; font-size:13px; font-weight:500; cursor:pointer; text-align:left; }
.navBtn:hover { background:#171f28; color:#eef1f4; }
.navBtnActive { background:#1d2632; color:#e8a33d; }
.primaryBtn { display:flex; align-items:center; gap:7px; background:linear-gradient(135deg,#e8a33d,#c97a2e); color:#12181f; border:none; padding:9px 16px; border-radius:9px; font-weight:600; font-size:13px; cursor:pointer; white-space:nowrap; }
.primaryBtn:hover { filter:brightness(1.06); }
.primaryBtn:disabled { opacity:0.5; cursor:not-allowed; }
.ghostBtn { display:flex; align-items:center; gap:6px; background:transparent; color:#aab4bf; border:1px solid #2a3440; padding:9px 14px; border-radius:9px; font-size:13px; cursor:pointer; }
.ghostBtn:hover { border-color:#3a4552; color:#eef1f4; }
.statusBtn { padding:6px 12px; border-radius:7px; border:1px solid; font-size:12px; font-weight:600; cursor:pointer; }
.categoryHeader { display:flex; align-items:center; gap:10px; width:100%; padding:14px 18px; background:transparent; border:none; color:#eef1f4; cursor:pointer; }
.categoryHeader:hover { background:#151b23; }
.typeTag { font-size:10px; font-weight:700; padding:2px 7px; border-radius:5px; text-transform:uppercase; letter-spacing:0.3px; }
.typeTagMand { background:rgba(194,84,80,0.15); color:#e08480; }
.typeTagOpt { background:rgba(91,101,114,0.25); color:#9aa5b1; }
.iconBtn { background:#171f28; border:1px solid #232d38; color:#aab4bf; padding:6px; border-radius:7px; cursor:pointer; display:flex; }
.iconBtn:hover { color:#eef1f4; border-color:#3a4552; }
.iconBtnDanger { color:#e08480; border-color:#5a3230; }
.checkPill { display:flex; align-items:center; gap:6px; border:1px solid #2a3440; border-radius:99px; padding:6px 12px; font-size:12.5px; cursor:pointer; }
input, select, textarea { background:#171f28; border:1px solid #232d38; border-radius:8px; padding:9px 11px; color:#eef1f4; font-size:13px; outline:none; width:100%; box-sizing:border-box; font-family:'Inter',sans-serif; }
input:focus, select:focus, textarea:focus { border-color:#e8a33d; }
input[type=date] { color-scheme: dark; }
input[type=checkbox] { width:auto !important; }
@media print { .noPrint { display:none !important; } body { background:white; } }
.spinner { width:28px; height:28px; border:3px solid #232d38; border-top-color:#e8a33d; border-radius:50%; margin:0 auto; animation:spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
`;
