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

export function groupCounts(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

// Parses checklist rows pasted from a spreadsheet (tab- or comma-separated):
// Category, Question, Weight (1-5, optional), Mandatory/Optional (optional).
// The last two columns fall back to sensible defaults when missing/invalid.
export function parseBulkRows(text) {
  return text
    .split("\n")
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l.trim().length > 0)
    .map((line) => {
      const cols = line.includes("\t") ? line.split("\t") : line.split(",");
      const category = (cols[0] || "").trim();
      const item = (cols[1] || "").trim();
      let weight = parseInt((cols[2] || "").trim(), 10);
      if (!weight || weight < 1 || weight > 5) weight = 3;
      let type = (cols[3] || "").trim();
      type = /optional/i.test(type) ? "Optional" : "Mandatory";
      return { category, item, weight, type };
    })
    .filter((r) => r.category && r.item);
}

// Parses rows from an uploaded XLSX/CSV file (already converted to a 2D
// array via XLSX.utils.sheet_to_json). If the first row looks like a header
// (has "Category" and "Question" cells), those column positions are used
// and the header row is skipped; otherwise a fixed column order is assumed.
export function parseExcelRows(rows) {
  if (!rows || rows.length === 0) return [];

  const first = rows[0].map((cell) => String(cell || "").trim().toLowerCase());
  let start = 0;
  let colCategory = 0, colQuestion = 1, colWeight = 2, colType = 3;

  if (first.some((cell) => cell === "category") && first.some((cell) => cell === "question")) {
    start = 1;
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
      const category = String(cols[colCategory] || "").trim();
      const item = String(cols[colQuestion] || "").trim();
      let weight = parseInt(String(cols[colWeight] || "").trim(), 10);
      if (!weight || weight < 1 || weight > 5) weight = 3;
      let type = String(cols[colType] || "").trim();
      type = /optional/i.test(type) ? "Optional" : "Mandatory";
      return { category, item, weight, type };
    })
    .filter((r) => r.category && r.item);
}
