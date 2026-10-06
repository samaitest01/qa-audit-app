const { supabaseAdmin } = require("../../../lib/supabaseAdmin");

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  // Guard: builtin domains (e.g. "core") are injected into every audit by
  // AuditFormView regardless of what's in a project's domain_ids, so the
  // in-use check below would never see them as referenced — without this,
  // a direct API call could delete Core and cascade-delete its checklist
  // items for every project app-wide. The UI already hides the delete
  // button for builtin domains; this is the server-side backstop.
  const { data: domain, error: dErr } = await supabaseAdmin.from("domains").select("builtin").eq("id", id).maybeSingle();
  if (dErr) return res.status(500).json({ error: dErr.message });
  if (domain?.builtin) return res.status(409).json({ error: "Builtin domains can't be deleted." });

  // Guard: refuse if any project still references this domain.
  const { data: projects, error: pErr } = await supabaseAdmin.from("projects").select("id, domain_ids");
  if (pErr) return res.status(500).json({ error: pErr.message });
  const inUse = (projects || []).some((p) => (p.domain_ids || []).includes(id));
  if (inUse) return res.status(409).json({ error: "A project still uses this domain." });

  const { error } = await supabaseAdmin.from("domains").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
}
