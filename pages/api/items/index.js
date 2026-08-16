const { supabaseAdmin } = require("../../../lib/supabaseAdmin");
import { uid } from "../../../lib/scoring";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { domainId, section, category, item, weight, type, bulk } = req.body || {};

  // Bulk import: { domainId, bulk: [{ section, category, item, weight, type }, ...] }
  if (Array.isArray(bulk)) {
    const rows = bulk
      .filter((r) => r.category && r.item)
      .map((r) => ({
        id: uid(),
        domain_id: domainId,
        section: (r.section && String(r.section).trim()) || "Manual",
        category: String(r.category).trim(),
        question: String(r.item).trim(),
        weight: Number(r.weight) >= 1 && Number(r.weight) <= 5 ? Number(r.weight) : 3,
        type: /optional/i.test(r.type || "") ? "Optional" : "Mandatory",
      }));
    if (rows.length === 0) return res.status(400).json({ error: "No valid rows to import." });
    const { data, error } = await supabaseAdmin.from("checklist_items").insert(rows).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (!domainId || !category || !item) return res.status(400).json({ error: "domainId, category, and item are required" });

  const { data, error } = await supabaseAdmin
    .from("checklist_items")
    .insert({
      id: uid(), domain_id: domainId, section: (section && section.trim()) || "Manual",
      category: category.trim(), question: item.trim(),
      weight: weight || 3, type: type || "Mandatory",
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}
