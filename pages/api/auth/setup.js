const crypto = require("crypto");
const { getPasswordHash, setPasswordHash, hashPassword } = require("../../../lib/authSettings");

const COOKIE_NAME = "qa_auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body || {};
  if (!password || password.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters." });

  const secret = process.env.SESSION_SECRET;
  if (!secret) return res.status(500).json({ error: "Server is missing SESSION_SECRET — set it in Vercel's Environment Variables." });

  try {
    const existing = await getPasswordHash();
    if (existing) return res.status(409).json({ error: "A password is already set up for this app." });

    await setPasswordHash(hashPassword(password));

    const token = crypto.createHmac("sha256", secret).update("authenticated").digest("hex");
    const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secureFlag}`);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
