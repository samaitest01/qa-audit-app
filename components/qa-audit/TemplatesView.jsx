import { useState } from "react";
import * as XLSX from "xlsx";
import { CheckCircle2, ChevronDown, ClipboardPaste, Plus, Trash2, X } from "lucide-react";
import { parseBulkRows, parseExcelRows } from "./utils";
import Field from "./Field";
import { styles } from "./styles";

export default function TemplatesView({ domains, items, onAddDomain, onDeleteDomain, onAddItem, onBulkImport, onUpdateItem, onDeleteItem }) {
  const [openDomain, setOpenDomain] = useState(null);
  const [newDomain, setNewDomain] = useState(null);
  const [confirmDomainId, setConfirmDomainId] = useState(null);

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.h1}>Domains & Templates</h1>
          <p style={styles.subtle}>Add domains and edit checklist items — changes apply to every future audit.</p>
        </div>
        <button className="primaryBtn" onClick={() => setNewDomain({ name: "", description: "" })}>
          <Plus size={15} /> New domain
        </button>
      </div>

      {newDomain && (
        <div style={styles.editorPanel}>
          <div style={styles.metaGrid}>
            <Field label="Domain name">
              <input
                value={newDomain.name}
                onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                placeholder="e.g. Medical Devices"
              />
            </Field>
            <Field label="Description">
              <input
                value={newDomain.description}
                onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })}
                placeholder="One line describing this domain"
              />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              className="primaryBtn"
              onClick={async () => {
                if (newDomain.name.trim()) {
                  const id = await onAddDomain(newDomain.name.trim(), newDomain.description.trim());
                  setNewDomain(null);
                  setOpenDomain(id);
                }
              }}
            >
              Create domain
            </button>
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
              <span style={styles.categoryName}>
                {d.name}
                {d.builtin && <span style={styles.coreTag}>core</span>}
              </span>
              <span style={styles.categoryCount}>{domainItems.length} items</span>
              {!d.builtin && (
                confirmDomainId === d.id ? (
                  <button
                    className="iconBtn iconBtnDanger"
                    title="Confirm delete — removes all its items too"
                    onClick={(e) => { e.stopPropagation(); onDeleteDomain(d.id); setConfirmDomainId(null); }}
                  >
                    <CheckCircle2 size={13} />
                  </button>
                ) : (
                  <button
                    className="iconBtn iconBtnDanger"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); setConfirmDomainId(d.id); }}
                  >
                    <Trash2 size={13} />
                  </button>
                )
              )}
            </button>
            {isOpen && (
              <div style={{ padding: "4px 18px 18px" }}>
                <p style={styles.subtle}>{d.description}</p>
                <TemplateEditor
                  domainId={d.id}
                  items={domainItems}
                  onAddItem={onAddItem}
                  onBulkImport={onBulkImport}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TemplateEditor({ domainId, items, onAddItem, onBulkImport, onUpdateItem, onDeleteItem }) {
  const [draft, setDraft] = useState({ section: "Manual", category: "", item: "", weight: 3, type: "Mandatory" });
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [fileError, setFileError] = useState("");
  const [uploadedRows, setUploadedRows] = useState([]);

  // Section -> Category -> items, in first-seen order (mirrors the
  // restructured question bank's Section/Category/Question hierarchy).
  const bySection = [];
  items.forEach((it) => {
    const section = it.section || "Manual";
    let sectionBucket = bySection.find((x) => x.section === section);
    if (!sectionBucket) {
      sectionBucket = { section, categories: [] };
      bySection.push(sectionBucket);
    }
    let catBucket = sectionBucket.categories.find((x) => x.category === it.category);
    if (!catBucket) {
      catBucket = { category: it.category, items: [] };
      sectionBucket.categories.push(catBucket);
    }
    catBucket.items.push(it);
  });

  // Rows can come from the paste textarea and/or an uploaded file at the
  // same time — both are merged into one list to import together.
  const parsedRows = bulkOpen ? [...parseBulkRows(bulkText), ...uploadedRows] : [];

  const handleFileChange = async (e) => {
    setFileError("");
    setUploadedRows([]);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const parsed = parseExcelRows(rows);
      if (parsed.length === 0) {
        setFileError("No valid rows found in file. Use Category + Question columns.");
        return;
      }
      setUploadedRows(parsed);
    } catch (err) {
      console.error(err);
      setFileError("Unable to parse file. Use XLSX or CSV with Category and Question columns.");
    }
  };

  return (
    <div>
      {bySection.map((s) => (
        <div key={s.section} style={{ marginTop: 16 }}>
          <div style={styles.templateSectionLabel}>{s.section}</div>
          {s.categories.map((c) => (
            <div key={c.category} style={{ marginTop: 10 }}>
              <div style={styles.templateCatLabel}>{c.category}</div>
              {c.items.map((it) => <TemplateRow key={it.id} item={it} onUpdate={onUpdateItem} onDelete={onDeleteItem} />)}
            </div>
          ))}
        </div>
      ))}

      <div style={styles.addItemRow}>
        <input
          placeholder="Section"
          style={{ width: 100 }}
          value={draft.section}
          onChange={(e) => setDraft({ ...draft, section: e.target.value })}
        />
        <input
          placeholder="Category"
          style={{ width: 160 }}
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
        />
        <input
          placeholder="Checklist question…"
          style={{ flex: 1 }}
          value={draft.item}
          onChange={(e) => setDraft({ ...draft, item: e.target.value })}
        />
        <input
          type="number"
          min={1}
          max={5}
          style={{ width: 60 }}
          value={draft.weight}
          onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) })}
        />
        <select style={{ width: 110 }} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
          <option>Mandatory</option>
          <option>Optional</option>
        </select>
        <button
          className="iconBtn"
          title="Add item"
          onClick={() => {
            if (draft.category.trim() && draft.item.trim()) {
              onAddItem(domainId, draft.section.trim() || "Manual", draft.category.trim(), draft.item.trim(), draft.weight, draft.type);
              setDraft({ section: draft.section, category: draft.category, item: "", weight: 3, type: "Mandatory" });
            }
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      <button className="ghostBtn" style={{ marginTop: 10 }} onClick={() => setBulkOpen((v) => !v)}>
        <ClipboardPaste size={14} /> {bulkOpen ? "Hide bulk import" : "Bulk import from a question bank"}
      </button>

      {bulkOpen && (
        <div style={styles.bulkPanel}>
          <p style={styles.subtle}>
            Paste rows copied from Excel/Sheets: <b>Category</b>, <b>Question</b>, <b>Weight (1-5, optional)</b>, <b>Mandatory/Optional (optional)</b> — or 5 columns with <b>Section</b> first. Tab- or comma-separated, one question per line.
          </p>
          <textarea
            style={styles.bulkTextarea}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder={"Manual\tConnectivity & Protocols\tBluetooth pairing is tested across all supported devices.\t4\tMandatory"}
          />
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
              <span style={styles.subtle}>Upload XLSX / CSV — a header row with a "Section" column is picked up automatically.</span>
            </label>
            {fileError && <div style={{ color: "#e08480", fontSize: 12.5 }}>{fileError}</div>}
            {uploadedRows.length > 0 && <div style={{ color: "#b0d6a4", fontSize: 12.5 }}>{uploadedRows.length} rows ready from file upload.</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                className="primaryBtn"
                disabled={parsedRows.length === 0}
                onClick={async () => {
                  await onBulkImport(domainId, parsedRows);
                  setBulkText("");
                  setUploadedRows([]);
                  setBulkOpen(false);
                }}
              >
                <Plus size={15} /> Import {parsedRows.length} item{parsedRows.length !== 1 ? "s" : ""}
              </button>
              {parsedRows.length === 0 && <span style={{ color: "#e08480", fontSize: 12.5 }}>No valid rows detected.</span>}
            </div>
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
      <select value={item.weight} onChange={(e) => onUpdate({ ...item, weight: Number(e.target.value) })} style={{ width: 56 }}>
        {[1, 2, 3, 4, 5].map((w) => <option key={w} value={w}>{w}</option>)}
      </select>
      <select value={item.type} onChange={(e) => onUpdate({ ...item, type: e.target.value })} style={{ width: 100 }}>
        <option>Mandatory</option>
        <option>Optional</option>
      </select>
      <button className="iconBtn iconBtnDanger" onClick={() => onDelete(item.id)}><Trash2 size={13} /></button>
    </div>
  );
}
