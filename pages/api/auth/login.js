const COOKIE_NAME = "qa_auth";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body || {};
  // ADMIN_PASSWORD is the preferred name; SITE_PASSWORD (the single-login
  // predecessor of this file) still works too, so existing deployments
  // don't need their env vars renamed for Admin login to keep working.
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.SITE_PASSWORD;
  const auditorPassword = process.env.AUDITOR_PASSWORD;

  if (!adminPassword && !auditorPassword) {
    return res.status(500).json({ error: "Server is missing ADMIN_PASSWORD/AUDITOR_PASSWORD — set them in Vercel's Environment Variables." });
  }

  let role = null;
  if (adminPassword && password === adminPassword) role = "admin";
  else if (auditorPassword && password === auditorPassword) role = "auditor";

  if (!role) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${role}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secureFlag}`);
  res.status(200).json({ ok: true, role });
}
