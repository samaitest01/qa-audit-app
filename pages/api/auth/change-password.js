const crypto = require("crypto");
const { getPasswordHash, setPasswordHash, hashPassword, verifyPassword } = require("../../../lib/authSettings");

const COOKIE_NAME = "qa_auth";

function isAuthed(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  const cookie = req.cookies?.[COOKIE_NAME];
  if (!cookie) return false;
  const expected = crypto.createHmac("sha256", secret).update("authenticated").digest("hex");
  return cookie === expected;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAuthed(req)) return res.status(401).json({ error: "Not authenticated." });

  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: "New password must be at least 4 characters." });

  try {
    const hash = await getPasswordHash();
    if (hash && !verifyPassword(currentPassword || "", hash)) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }
    await setPasswordHash(hashPassword(newPassword));
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
