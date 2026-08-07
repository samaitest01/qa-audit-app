const COOKIE_NAME = "qa_auth";
const AUTH_TOKEN = "authenticated";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body || {};
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return res.status(500).json({ error: "Server is missing SITE_PASSWORD — set it in Vercel's Environment Variables." });
  }
  if (password !== sitePassword) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${AUTH_TOKEN}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secureFlag}`);
  res.status(200).json({ ok: true });
}
