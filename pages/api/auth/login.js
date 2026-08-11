const crypto = require("crypto");
const { getPasswordHash, verifyPassword } = require("../../../lib/authSettings");

const COOKIE_NAME = "qa_auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body || {};
  const secret = process.env.SESSION_SECRET;
  if (!secret) return res.status(500).json({ error: "Server is missing SESSION_SECRET — set it in Vercel's Environment Variables." });

  try {
    const hash = await getPasswordHash();
    if (!hash) return res.status(409).json({ error: "No password has been set up yet.", needsSetup: true });
    if (!password || !verifyPassword(password, hash)) return res.status(401).json({ error: "Incorrect password." });

    // middleware.js recomputes this same HMAC (via Web Crypto, since Edge
    // runtime has no Node `crypto`) to verify the cookie on every request —
    // the two must stay in sync if this changes.
    const token = crypto.createHmac("sha256", secret).update("authenticated").digest("hex");
    const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secureFlag}`);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
