import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const b = req.body || {};
    const row = {
      project_id: b.projectId, project_name: b.projectName, client: b.client,
      domain_ids: b.domainIds || [], auditee: b.auditee, auditor: b.auditor,
      audit_date: b.date, answers: b.answers || {}, score: b.score,
      answered_count: b.answeredCount, total_count: b.totalCount,
      saved_at: new Date().toISOString(),
    };
    const { data, error } = await supabaseAdmin.from("audits").update(row).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({
      id: data.id, projectId: data.project_id, projectName: data.project_name, client: data.client,
      domainIds: data.domain_ids || [], auditee: data.auditee, auditor: data.auditor,
      date: data.audit_date, answers: data.answers || {}, score: data.score,
      answeredCount: data.answered_count, totalCount: data.total_count, savedAt: data.saved_at,
    });
  }

  if (req.method === "DELETE") {
    const { error } = await supabaseAdmin.from("audits").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  res.status(405).json({ error: "Method not allowed" });
}
