const { supabaseAdmin } = require("../../../lib/supabaseAdmin");
import { uid } from "../../../lib/scoring";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const b = req.body || {};

  // The audits table uses snake_case columns; the frontend sends/expects
  // camelCase, so requests and responses are mapped by hand on the way in
  // and out (mirrored below when building the JSON response).
  const row = {
    id: uid(),
    project_id: b.projectId, project_name: b.projectName, client: b.client,
    domain_ids: b.domainIds || [], auditee: b.auditee, auditor: b.auditor,
    audit_date: b.date, answers: b.answers || {}, score: b.score,
    answered_count: b.answeredCount, total_count: b.totalCount,
    saved_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin.from("audits").insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({
    id: data.id, projectId: data.project_id, projectName: data.project_name, client: data.client,
    domainIds: data.domain_ids || [], auditee: data.auditee, auditor: data.auditor,
    date: data.audit_date, answers: data.answers || {}, score: data.score,
    answeredCount: data.answered_count, totalCount: data.total_count, savedAt: data.saved_at,
  });
}
