import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { category, item, weight, type } = req.body || {};
    const { data, error } = await supabaseAdmin
      .from("checklist_items")
      .update({ category, question: item, weight, type })
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    const { error } = await supabaseAdmin.from("checklist_items").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  res.status(405).json({ error: "Method not allowed" });
}
