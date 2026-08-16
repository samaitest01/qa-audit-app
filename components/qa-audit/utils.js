export function quarterLabel(dateString) {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date)) return "Unknown";
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `Q${q} ${date.getFullYear()}`;
  } catch {
    return "Unknown";
  }
}

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
