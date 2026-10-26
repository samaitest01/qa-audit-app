import { useMemo, useState } from "react";
import { CheckCircle2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Field from "./Field";
import { styles } from "./styles";

const STATUSES = ["Active", "Hold", "Closed"];
const statusClass = (status) =>
  status === "Hold" ? "statusHold" : status === "Closed" ? "statusClosed" : "statusActive";

export default function ProjectsView({ projects, domains, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [query, setQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const clients = useMemo(
    () => Array.from(new Set(projects.map((p) => p.client).filter(Boolean))).sort(),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (clientFilter && p.client !== clientFilter) return false;
      if (typeFilter && (p.type || "Manual") !== typeFilter) return false;
      if (statusFilter && (p.status || "Active") !== statusFilter) return false;
      if (!q) return true;
      const domainNames = (p.domainIds || []).map((did) => domains.find((x) => x.id === did)?.name || "").join(" ");
      return [p.name, p.client, p.type, domainNames].join(" ").toLowerCase().includes(q);
    });
  }, [projects, domains, query, clientFilter, typeFilter, statusFilter]);

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.h1}>Projects</h1>
          <p style={styles.subtle}>
            {projects.length} project{projects.length !== 1 ? "s" : ""}. Each holds one or more domains, which decide its audit checklist.
          </p>
        </div>
        <button className="primaryBtn" onClick={() => setEditing({ name: "", client: "", domainIds: [], type: "Manual", status: "Active" })}>
          <Plus size={15} /> New project
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <div style={{ ...styles.searchWrap, marginTop: 0, maxWidth: 360 }}>
          <Search size={14} color="#7c8794" />
          <input
            style={styles.searchInput}
            placeholder="Search projects by name, client, or domain…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All types</option>
          <option value="Manual">Manual</option>
          <option value="Automation">Automation</option>
        </select>
        {(clientFilter || typeFilter || statusFilter || query) && (
          <button className="ghostBtn" onClick={() => { setClientFilter(""); setTypeFilter(""); setStatusFilter(""); setQuery(""); }}>
            Clear filters
          </button>
        )}
      </div>

      {editing && (
        <ProjectEditor
          project={editing}
          domains={domains}
          onCancel={() => setEditing(null)}
          onSave={(p) => { onSave(p); setEditing(null); }}
        />
      )}

      {filteredProjects.length === 0 && (
        <p style={styles.subtle}>No projects match the current search and filters.</p>
      )}

      <div style={styles.cardGrid}>
        {filteredProjects.map((p) => (
          <div key={p.id} style={styles.projectCard}>
            <div style={styles.projectCardTop}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={styles.projectName}>{p.name}</div>
                  <span className={`statusPill ${statusClass(p.status)}`} style={styles.statusPill}>{p.status || "Active"}</span>
                </div>
                <div style={styles.subtle}>{p.client}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="iconBtn" onClick={() => setEditing(p)}><Pencil size={14} /></button>
                {confirmId === p.id ? (
                  <button
                    className="iconBtn iconBtnDanger"
                    title="Confirm delete — its past audits stay in Audit History, viewable read-only"
                    onClick={() => { onDelete(p.id); setConfirmId(null); }}
                  >
                    <CheckCircle2 size={14} /> Confirm
                  </button>
                ) : (
                  <button className="iconBtn iconBtnDanger" title="Delete" onClick={() => setConfirmId(p.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
            <div style={styles.domainBadgeRow}>
              <span style={styles.typeBadge}>{p.type === "Automation" ? "Automation" : "Manual"}</span>
              {(p.domainIds || []).map((did) => {
                const d = domains.find((x) => x.id === did);
                return <span key={did} style={styles.domainBadge}>{d?.name || did}</span>;
              })}
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
  const [type, setType] = useState(project.type === "Automation" ? "Automation" : "Manual");
  const [status, setStatus] = useState(STATUSES.includes(project.status) ? project.status : "Active");
  const assignable = domains.filter((d) => !d.builtin);

  const toggle = (id) =>
    setDomainIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div style={styles.editorPanel}>
      <div style={styles.metaGrid}>
        <Field label="Project name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FleetTrack Telematics" />
        </Field>
        <Field label="Client">
          <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Pentana Solutions" />
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Manual</option>
            <option>Automation</option>
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={styles.fieldLabel}>Domain(s) — Core is always included automatically</div>
        <div style={styles.checkGrid}>
          {assignable.map((d) => (
            <label
              key={d.id}
              className="checkPill"
              style={{
                background: domainIds.includes(d.id) ? "#2a2117" : "transparent",
                borderColor: domainIds.includes(d.id) ? "#e8a33d" : "#2a3440",
              }}
            >
              <input type="checkbox" checked={domainIds.includes(d.id)} onChange={() => toggle(d.id)} style={{ width: "auto" }} /> {d.name}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          className="primaryBtn"
          onClick={() => {
            if (name.trim()) onSave({ ...project, name: name.trim(), client: client.trim(), domainIds, type, status });
          }}
        >
          Save project
        </button>
        <button className="ghostBtn" onClick={onCancel}><X size={14} /> Cancel</button>
      </div>
    </div>
  );
}
