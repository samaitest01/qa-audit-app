// A project is typed Manual or Automation; a checklist item's Section is
// Manual, Automation, or "Shared (Manual & Automation)" (always included).
// Within a single domain, if NONE of its items match the project's type,
// the whole domain is included unfiltered rather than showing nothing —
// e.g. an Automation-type project on the Automotive domain (which is
// entirely Section=Manual) still gets its full Automotive checklist,
// since there's no Automation-specific content there to filter down to.
export function filterItemsForProjectType(domainItems, projectType) {
  if (!projectType) return domainItems;
  const matching = domainItems.filter((it) => {
    const section = it.section || "Manual";
    return section === "Shared (Manual & Automation)" || section === projectType;
  });
  return matching.length > 0 ? matching : domainItems;
}

// A saved audit is only complete once every checklist item it was created
// against has been answered (see AuditFormView's handleSaveDraft); anything
// less is a draft and shouldn't count as a completed audit of that project
// for coverage or scoring purposes.
export function isDraftAudit(audit) {
  return (audit.totalCount || 0) > (audit.answeredCount || 0);
}

// Distinct projects with at least one completed (non-draft) audit — the
// single source of truth for "how many projects are audited", shared by the
// sidebar quick-stat and the Dashboard's coverage ring so they can't drift
// into showing two different numbers for what looks like the same question
// (a project audited more than once, or an audit record with no matching
// project, would otherwise throw off a count kept separately in each place).
export function auditedProjectIds(projects, audits) {
  const projectIds = new Set(projects.map((p) => p.id));
  return new Set(
    audits
      .filter((a) => !isDraftAudit(a))
      .map((a) => a.projectId)
      .filter((id) => projectIds.has(id))
  );
}

// This program's fiscal year runs April–March, and audits are grouped by
// fiscal quarter (FY-2026 = Apr 2026–Mar 2027, so FY-2026 Q1 = Apr–Jun
// 2026 … Q4 = Jan–Mar 2027) rather than calendar quarters.
const FISCAL_YEAR_START_MONTH = 3; // April, 0-indexed (Jan=0)

export function fiscalQuarterLabel(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date)) return "Unknown";
  const month = date.getMonth();
  const year = date.getFullYear();
  const fiscalYear = month >= FISCAL_YEAR_START_MONTH ? year : year - 1;
  const offset = (month - FISCAL_YEAR_START_MONTH + 12) % 12;
  const quarter = Math.floor(offset / 3) + 1;
  return `FY-${fiscalYear} Q${quarter}`;
}

// Quarter picker options for the audit form: a bounded, chronological
// window around today (a few quarters back for late-logging a recent
// audit, a few ahead for scheduling), rather than open-ended free text.
export function quarterOptions(before = 4, after = 4, today = new Date()) {
  const labels = [];
  for (let i = -before; i <= after; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i * 3, 1);
    labels.push(fiscalQuarterLabel(d));
  }
  return Array.from(new Set(labels));
}

// The quarter an audit counts toward is whatever was explicitly chosen on
// the audit form — not recomputed from its date, since the two can
// legitimately differ (e.g. logged a few days late but still meant for
// last quarter's cycle). Audits saved before the Quarter field existed
// fall back to a date-derived guess.
export function auditQuarterLabel(audit) {
  return audit.quarter || fiscalQuarterLabel(audit.date);
}

// Groups completed (non-draft) audits by project, ordered oldest-first, so
// each project's Nth entry is its Nth audit regardless of calendar phase —
// no fixed Phase I–IV columns, a project just has as many entries as it's
// actually been audited.
export function auditsByProject(projects, audits) {
  const byProject = new Map(projects.map((p) => [p.id, []]));
  audits
    .filter((a) => !isDraftAudit(a) && byProject.has(a.projectId))
    .forEach((a) => byProject.get(a.projectId).push(a));
  byProject.forEach((list) => list.sort((a, b) => (a.date || "").localeCompare(b.date || "")));
  return byProject;
}

export function groupCounts(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

// Parses checklist rows pasted from a spreadsheet (tab- or comma-separated).
// 5+ columns: Section, Category, Question, Weight (1-5, optional), Mandatory/Optional (optional).
// 4 columns (legacy format, no Section): Category, Question, Weight, Type.
// Weight/Type/Section all fall back to sensible defaults when missing/invalid.
export function parseBulkRows(text) {
  return text
    .split("\n")
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l.trim().length > 0)
    .map((line) => {
      const cols = line.includes("\t") ? line.split("\t") : line.split(",");
      const hasSection = cols.length >= 5;
      const section = (hasSection ? cols[0] : "").trim();
      const category = (cols[hasSection ? 1 : 0] || "").trim();
      const item = (cols[hasSection ? 2 : 1] || "").trim();
      let weight = parseInt((cols[hasSection ? 3 : 2] || "").trim(), 10);
      if (!weight || weight < 1 || weight > 5) weight = 3;
      let type = (cols[hasSection ? 4 : 3] || "").trim();
      type = /optional/i.test(type) ? "Optional" : "Mandatory";
      return { section: section || "Manual", category, item, weight, type };
    })
    .filter((r) => r.category && r.item);
}

// Parses rows from an uploaded XLSX/CSV file (already converted to a 2D
// array via XLSX.utils.sheet_to_json). If the first row looks like a header
// (has "Category" and "Question" cells), those column positions are used
// (including "Section" if present — "Domain"/"Status" columns are ignored)
// and the header row is skipped; otherwise a fixed column order is assumed.
export function parseExcelRows(rows) {
  if (!rows || rows.length === 0) return [];

  const first = rows[0].map((cell) => String(cell || "").trim().toLowerCase());
  let start = 0;
  let colSection = -1, colCategory = 0, colQuestion = 1, colWeight = 2, colType = 3;

  if (first.some((cell) => cell === "category") && first.some((cell) => cell === "question")) {
    start = 1;
    colSection = first.findIndex((cell) => cell === "section");
    colCategory = first.findIndex((cell) => cell === "category");
    colQuestion = first.findIndex((cell) => cell === "question" || cell === "question text");
    colWeight = first.findIndex((cell) => cell === "weight");
    colType = first.findIndex((cell) => cell === "type" || cell === "mandatory/optional");
    if (colQuestion === -1) colQuestion = 1;
  }

  return rows
    .slice(start)
    .map((row) => {
      const cols = Array.isArray(row) ? row : [];
      const section = colSection >= 0 ? String(cols[colSection] || "").trim() : "";
      const category = String(cols[colCategory] || "").trim();
      const item = String(cols[colQuestion] || "").trim();
      let weight = parseInt(String(cols[colWeight] || "").trim(), 10);
      if (!weight || weight < 1 || weight > 5) weight = 3;
      let type = String(cols[colType] || "").trim();
      type = /optional/i.test(type) ? "Optional" : "Mandatory";
      return { section: section || "Manual", category, item, weight, type };
    })
    .filter((r) => r.category && r.item);
}
