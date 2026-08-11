import { useCallback, useEffect, useState } from "react";
import { ClipboardList, FolderKanban, History, KeyRound, Layers } from "lucide-react";
import { api } from "./qa-audit/apiClient";
import { css, styles } from "./qa-audit/styles";
import AuditFormView from "./qa-audit/AuditFormView";
import ChangePasswordView from "./qa-audit/ChangePasswordView";
import DashboardView from "./qa-audit/DashboardView";
import HistoryView from "./qa-audit/HistoryView";
import ProjectsView from "./qa-audit/ProjectsView";
import ReportView from "./qa-audit/ReportView";
import TemplatesView from "./qa-audit/TemplatesView";

// Top-level app shell: owns all shared data + the sidebar nav, and renders
// whichever view is active. The individual views and their styling live in
// ./qa-audit/ — see that folder for the checklist form, dashboard, history,
// projects, templates, and report screens.
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

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

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
        if (!cancelled) {
          setLoadError(e.message);
          setReady(true);
        }
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
    } catch (e) {
      showToast(e.message);
    }
  };

  const addItem = async (domainId, category, item, weight, type) => {
    const raw = await api("items", { method: "POST", body: JSON.stringify({ domainId, category, item, weight, type }) });
    setItems((prev) => [
      ...prev,
      { id: raw.id, domainId: raw.domain_id, category: raw.category, item: raw.question, weight: raw.weight, type: raw.type },
    ]);
  };

  const bulkImportItems = async (domainId, rows) => {
    const raw = await api("items", { method: "POST", body: JSON.stringify({ domainId, bulk: rows }) });
    const mapped = raw.map((r) => ({
      id: r.id, domainId: r.domain_id, category: r.category, item: r.question, weight: r.weight, type: r.type,
    }));
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
    } catch (e) {
      showToast(e.message);
    }
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
        <div style={{ textAlign: "center" }}>
          <div className="spinner" />
          <div style={{ ...styles.subtle, marginTop: 12 }}>Loading…</div>
        </div>
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
          <div>
            <div style={styles.brandTitle}>Audit Console</div>
            <div style={styles.brandSub}>Multi-domain QA program</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <button className={`navBtn ${view === "form" ? "navBtnActive" : ""}`} onClick={() => setView("form")}>
            <ClipboardList size={16} /> New / Edit Audit
          </button>
          <button className={`navBtn ${view === "dashboard" ? "navBtnActive" : ""}`} onClick={() => setView("dashboard")}>
            <Layers size={16} /> Dashboard
          </button>
          <button className={`navBtn ${view === "history" ? "navBtnActive" : ""}`} onClick={() => setView("history")}>
            <History size={16} /> Audit History
          </button>
          <button className={`navBtn ${view === "projects" ? "navBtnActive" : ""}`} onClick={() => setView("projects")}>
            <FolderKanban size={16} /> Projects
          </button>
          <button className={`navBtn ${view === "templates" ? "navBtnActive" : ""}`} onClick={() => setView("templates")}>
            <Layers size={16} /> Domains & Templates
          </button>
          <button className={`navBtn ${view === "password" ? "navBtnActive" : ""}`} onClick={() => setView("password")}>
            <KeyRound size={16} /> Change Password
          </button>
        </nav>
        <div style={styles.sideStat}>
          <div style={styles.sideStatLabel}>Projects · Audits</div>
          <div style={styles.sideStatValue}>{projects.length} · {audits.length}</div>
        </div>
        <button
          className="ghostBtn"
          style={{ marginTop: "auto" }}
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
        >
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
        {view === "dashboard" && <DashboardView audits={audits} projects={projects} />}
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
