const { supabaseAdmin } = require("../../../lib/supabaseAdmin");

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { name, client, domainIds } = req.body || {};
    const { data, error } = await supabaseAdmin
      .from("projects")
      .update({ name, client, domain_ids: domainIds || [] })
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });

    // DB column is domain_ids (snake_case); the frontend works in camelCase.
    return res.status(200).json({ id: data.id, name: data.name, client: data.client, domainIds: data.domain_ids || [] });
  }

  if (req.method === "DELETE") {
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  res.status(405).json({ error: "Method not allowed" });
}
