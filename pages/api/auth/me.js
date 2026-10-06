const COOKIE_NAME = "qa_auth";
const ROLES = ["admin", "auditor"];

// Reads the role straight off the (httpOnly) session cookie so the client
// can decide what to show without that cookie ever being readable by JS.
export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const role = req.cookies?.[COOKIE_NAME];
  if (!ROLES.includes(role)) return res.status(401).json({ error: "Not authenticated" });

  res.status(200).json({ role });
}
