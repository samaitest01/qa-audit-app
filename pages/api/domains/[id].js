import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  // Guard: refuse if any project still references this domain.
  const { data: projects, error: pErr } = await supabaseAdmin.from("projects").select("id, domain_ids");
  if (pErr) return res.status(500).json({ error: pErr.message });
  const inUse = (projects || []).some((p) => (p.domain_ids || []).includes(id));
  if (inUse) return res.status(409).json({ error: "A project still uses this domain." });

  const { error } = await supabaseAdmin.from("domains").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
}
