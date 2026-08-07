const { supabaseAdmin } = require("../../lib/supabaseAdmin");
const { SEED_DOMAINS, SEED_ITEMS } = require("../../lib/seedData");

async function ensureSeeded() {
  const { count, error } = await supabaseAdmin.from("domains").select("*", { count: "exact", head: true });
  if (error) throw error;
  if (count && count > 0) return; // already seeded

  const { error: dErr } = await supabaseAdmin.from("domains").insert(SEED_DOMAINS);
  if (dErr) throw dErr;

  const itemRows = SEED_ITEMS.map((it) => ({
    id: it.id, domain_id: it.domainId, category: it.category,
    question: it.question, weight: it.weight, type: it.type,
  }));
  const { error: iErr } = await supabaseAdmin.from("checklist_items").insert(itemRows);
  if (iErr) throw iErr;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    await ensureSeeded();
  } catch (e) {
    return res.status(500).json({ error: `Setup failed: ${e.message}` });
  }

  const [domains, items, projects, audits] = await Promise.all([
    supabaseAdmin.from("domains").select("*").order("builtin", { ascending: false }),
    supabaseAdmin.from("checklist_items").select("*"),
    supabaseAdmin.from("projects").select("*").order("name"),
    supabaseAdmin.from("audits").select("*").order("saved_at", { ascending: false }),
  ]);

  for (const r of [domains, items, projects, audits]) {
    if (r.error) return res.status(500).json({ error: r.error.message });
  }

  // normalize snake_case -> camelCase for the frontend
  res.status(200).json({
    domains: domains.data,
    items: items.data.map((it) => ({
      id: it.id, domainId: it.domain_id, category: it.category,
      item: it.question, weight: it.weight, type: it.type,
    })),
    projects: projects.data.map((p) => ({
      id: p.id, name: p.name, client: p.client, domainIds: p.domain_ids || [],
    })),
    audits: audits.data.map((a) => ({
      id: a.id, projectId: a.project_id, projectName: a.project_name, client: a.client,
      domainIds: a.domain_ids || [], auditee: a.auditee, auditor: a.auditor,
      date: a.audit_date, answers: a.answers || {}, score: a.score,
      answeredCount: a.answered_count, totalCount: a.total_count, savedAt: a.saved_at,
    })),
  });
}
