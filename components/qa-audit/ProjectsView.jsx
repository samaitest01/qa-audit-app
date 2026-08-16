import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import Field from "./Field";
import { styles } from "./styles";

export default function ProjectsView({ projects, domains, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.h1}>Projects</h1>
          <p style={styles.subtle}>
            {projects.length} project{projects.length !== 1 ? "s" : ""}. Each holds one or more domains, which decide its audit checklist.
          </p>
        </div>
        <button className="primaryBtn" onClick={() => setEditing({ name: "", client: "", domainIds: [], type: "Manual" })}>
          <Plus size={15} /> New project
        </button>
      </div>

      {editing && (
        <ProjectEditor
          project={editing}
          domains={domains}
          onCancel={() => setEditing(null)}
          onSave={(p) => { onSave(p); setEditing(null); }}
        />
      )}

      <div style={styles.cardGrid}>
        {projects.map((p) => (
          <div key={p.id} style={styles.projectCard}>
            <div style={styles.projectCardTop}>
              <div>
                <div style={styles.projectName}>{p.name}</div>
                <div style={styles.subtle}>{p.client}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="iconBtn" onClick={() => setEditing(p)}><Pencil size={14} /></button>
                {confirmId === p.id ? (
                  <button
                    className="iconBtn iconBtnDanger"
                    title="Confirm delete — this also deletes its audit history"
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
            if (name.trim()) onSave({ ...project, name: name.trim(), client: client.trim(), domainIds, type });
          }}
        >
          Save project
        </button>
        <button className="ghostBtn" onClick={onCancel}><X size={14} /> Cancel</button>
      </div>
    </div>
  );
}
