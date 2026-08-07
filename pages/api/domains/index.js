import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { uid } from "../../../lib/scoring";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, description } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });

  const id = uid();
  const { data, error } = await supabaseAdmin
    .from("domains")
    .insert({ id, name: name.trim(), description: (description || "").trim(), builtin: false })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}
