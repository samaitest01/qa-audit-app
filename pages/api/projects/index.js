const { supabaseAdmin } = require("../../../lib/supabaseAdmin");
import { uid } from "../../../lib/scoring";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, client, domainIds } = req.body || {};

  if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });

  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({ id: uid(), name: name.trim(), client: (client || "").trim(), domain_ids: domainIds || [] })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // DB column is domain_ids (snake_case); the frontend works in camelCase.
  res.status(201).json({ id: data.id, name: data.name, client: data.client, domainIds: data.domain_ids || [] });
}
